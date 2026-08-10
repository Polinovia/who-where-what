import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { submitAnswerSchema } from "@/lib/validation/lobby";
import { resolveCurrentTurn } from "@/lib/db/current-turn";
import { checkGameFinishedAchievements } from "@/lib/db/achievements";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const parsed = submitAnswerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lobby = await prisma.lobby.findUnique({
    where: { code: code.toUpperCase() },
    include: { players: true },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby introuvable" }, { status: 404 });
  }

  if (lobby.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "La partie n'est pas en cours" },
      { status: 409 },
    );
  }

  const player = lobby.players.find((p) => p.id === parsed.data.playerId);
  if (!player) {
    return NextResponse.json(
      { error: "Joueur introuvable dans ce lobby" },
      { status: 404 },
    );
  }

  if (player.kicked) {
    return NextResponse.json(
      { error: "Tu as été exclu de cette partie" },
      { status: 403 },
    );
  }

  const turn = await resolveCurrentTurn(lobby, lobby.players, player, parsed.data.language);
  if (!turn) {
    return NextResponse.json(
      { error: "Impossible de déterminer l'histoire à écrire" },
      { status: 500 },
    );
  }
  const { round, story } = turn;

  try {
    await prisma.answer.create({
      data: {
        storyId: story.id,
        questionId: turn.question.id,
        playerId: player.id,
        order: round + 1,
        text: parsed.data.text,
        language: parsed.data.language,
      },
    });
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Réponse déjà envoyée pour ce tour" },
        { status: 409 },
      );
    }
    throw err;
  }

  const answersForRound = await prisma.answer.count({
    where: { order: round + 1, story: { lobbyId: lobby.id } },
  });

  if (answersForRound === lobby.players.length) {
    const nextRound = round + 1;
    const finished = nextRound >= lobby.totalQuestions;
    await prisma.lobby.updateMany({
      where: { id: lobby.id, currentRound: round },
      data: {
        currentRound: nextRound,
        status: finished ? "FINISHED" : "IN_PROGRESS",
      },
    });

    if (finished) {
      await checkGameFinishedAchievements(lobby.id);
    }
  }

  return NextResponse.json({ status: "ok" });
}
