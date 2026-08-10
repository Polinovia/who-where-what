import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveCurrentTurn } from "@/lib/db/current-turn";
import { languageSchema } from "@/lib/validation/lobby";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const playerId = request.nextUrl.searchParams.get("playerId");
  const parsedLanguage = languageSchema.safeParse(request.nextUrl.searchParams.get("language"));
  const language = parsedLanguage.success ? parsedLanguage.data : "fr";

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

  if (player.kicked) {
    return NextResponse.json(
      { error: "Tu as été exclu de cette partie" },
      { status: 403 },
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

  const turn = await resolveCurrentTurn(lobby, lobby.players, player, language);
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
    const answeredPlayerIds = new Set(
      (
        await prisma.answer.findMany({
          where: { order: round + 1, story: { lobbyId: lobby.id } },
          select: { playerId: true },
        })
      ).map((a) => a.playerId),
    );

    const waitingOn = lobby.players
      .filter((p) => !p.kicked && !answeredPlayerIds.has(p.id))
      .map((p) => p.pseudo);

    return NextResponse.json({
      status: "waiting",
      round,
      totalQuestions: lobby.totalQuestions,
      waitingOn,
    });
  }

  return NextResponse.json({
    status: "answer",
    round,
    totalQuestions: lobby.totalQuestions,
    storyId: story.id,
    question: { id: question.id, text: question.text, placeholders: question.placeholders },
  });
}
