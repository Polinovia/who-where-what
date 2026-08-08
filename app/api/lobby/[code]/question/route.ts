import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveCurrentTurn } from "@/lib/db/current-turn";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const playerId = request.nextUrl.searchParams.get("playerId");

  if (!playerId) {
    return NextResponse.json({ error: "playerId requis" }, { status: 400 });
  }

  const lobby = await prisma.lobby.findUnique({
    where: { code: code.toUpperCase() },
    include: { players: true },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby introuvable" }, { status: 404 });
  }

  const player = lobby.players.find((p) => p.id === playerId);
  if (!player) {
    return NextResponse.json(
      { error: "Joueur introuvable dans ce lobby" },
      { status: 404 },
    );
  }

  if (lobby.status === "LOBBY") {
    return NextResponse.json(
      { error: "La partie n'a pas encore commencé" },
      { status: 409 },
    );
  }

  if (lobby.status === "FINISHED" || lobby.currentRound >= lobby.totalQuestions) {
    return NextResponse.json({ status: "finished" });
  }

  if (player.seat === null) {
    return NextResponse.json(
      { error: "Ce joueur n'a pas de siège attribué" },
      { status: 409 },
    );
  }

  const turn = await resolveCurrentTurn(lobby, lobby.players, player);
  if (!turn) {
    return NextResponse.json(
      { error: "Impossible de déterminer l'histoire à écrire" },
      { status: 500 },
    );
  }
  const { round, story, question } = turn;

  const existingAnswer = await prisma.answer.findUnique({
    where: { storyId_order: { storyId: story.id, order: round + 1 } },
  });

  if (existingAnswer) {
    return NextResponse.json({
      status: "waiting",
      round,
      totalQuestions: lobby.totalQuestions,
    });
  }

  return NextResponse.json({
    status: "answer",
    round,
    totalQuestions: lobby.totalQuestions,
    storyId: story.id,
    question: { id: question.id, text: question.text },
  });
}
