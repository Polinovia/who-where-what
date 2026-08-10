import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { pseudoSchema, languageSchema } from "@/lib/validation/lobby";
import { generateLobbyCode } from "@/lib/lobby-code";
import { DEFAULT_CATEGORY_NAME } from "@/lib/categories";
import { startLobby } from "@/lib/db/start-lobby";

// Fixed, known-good defaults — Classic has enough questions in both
// languages, and 3 bots + the human keeps a solo game short.
const BOT_COUNT = 3;
const TOTAL_QUESTIONS = 8;

const soloSchema = z.object({
  pseudo: pseudoSchema,
  language: languageSchema.optional().default("fr"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  const body = await request.json().catch(() => null);
  const parsed = soloSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { pseudo, language } = parsed.data;

  const category = await prisma.category.findUnique({ where: { name: DEFAULT_CATEGORY_NAME } });
  if (!category) {
    return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
  }

  let lobby;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateLobbyCode();
    try {
      lobby = await prisma.lobby.create({
        data: {
          code,
          maxPlayers: BOT_COUNT + 1,
          totalQuestions: TOTAL_QUESTIONS,
          categoryId: category.id,
          language,
          players: {
            create: [
              { pseudo, isHost: true, ready: true, userId: session?.user?.id },
              ...Array.from({ length: BOT_COUNT }, (_, i) => ({
                pseudo: `🤖 Bot ${i + 1}`,
                isBot: true,
                ready: true,
              })),
            ],
          },
        },
        include: { players: true },
      });
      break;
    } catch (err) {
      if (
        err instanceof Error &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        continue;
      }
      throw err;
    }
  }

  if (!lobby) {
    return NextResponse.json(
      { error: "Impossible de générer un code de lobby, réessaie" },
      { status: 500 },
    );
  }

  const started = await prisma.$transaction((tx) => startLobby(tx, lobby.id, lobby.players));

  return NextResponse.json({ lobby: started }, { status: 201 });
}
