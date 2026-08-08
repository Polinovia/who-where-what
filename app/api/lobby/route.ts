import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { createLobbySchema } from "@/lib/validation/lobby";
import { generateLobbyCode } from "@/lib/lobby-code";
import { DEFAULT_CATEGORY_NAME } from "@/lib/categories";

export async function POST(request: NextRequest) {
  const session = await auth();
  const body = await request.json().catch(() => null);
  const parsed = createLobbySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { pseudo, name, maxPlayers, totalQuestions, categoryId } = parsed.data;

  const category = categoryId
    ? await prisma.category.findUnique({ where: { id: categoryId } })
    : await prisma.category.findUnique({ where: { name: DEFAULT_CATEGORY_NAME } });

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
          name,
          maxPlayers,
          totalQuestions,
          categoryId: category.id,
          players: {
            create: { pseudo, isHost: true, userId: session?.user?.id },
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

  return NextResponse.json({ lobby }, { status: 201 });
}
