import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { resolveCurrentTurn } from "@/lib/db/current-turn";

const kickSchema = z.object({
  requesterPlayerId: z.string().min(1),
  targetPlayerId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const parsed = kickSchema.safeParse(body);

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

  if (lobby.status === "FINISHED") {
    return NextResponse.json(
      { error: "La partie est terminée" },
      { status: 409 },
    );
  }

  const requester = lobby.players.find((p) => p.id === parsed.data.requesterPlayerId);
  if (!requester?.isHost) {
    return NextResponse.json(
      { error: "Seul l'hôte peut exclure un joueur" },
      { status: 403 },
    );
  }

  if (parsed.data.targetPlayerId === requester.id) {
    return NextResponse.json(
      { error: "Tu ne peux pas t'exclure toi-même" },
      { status: 400 },
    );
  }

  const target = lobby.players.find((p) => p.id === parsed.data.targetPlayerId);
  if (!target) {
    return NextResponse.json(
      { error: "Joueur introuvable dans ce lobby" },
      { status: 404 },
    );
  }

  if (lobby.status === "LOBBY") {
    await prisma.player.delete({ where: { id: target.id } });

    const updatedLobby = await prisma.lobby.findUnique({
      where: { id: lobby.id },
      include: { players: true },
    });

    return NextResponse.json({ lobby: updatedLobby });
  }

  // Mid-game: don't delete the player (their answers/stories are still
  // referenced by other players' stories). Mark them kicked, backfill a
  // placeholder answer for every remaining round they'd have written, and
  // advance the round if that was the only thing blocking it.
  await prisma.$transaction(async (tx) => {
    await tx.player.update({ where: { id: target.id }, data: { kicked: true } });

    for (let round = lobby.currentRound; round < lobby.totalQuestions; round++) {
      // The placeholder text below isn't translated, so either language works —
      // fall back to "en" in case a category's "fr" set is missing this round's order.
      const turn =
        (await resolveCurrentTurn(
          { id: lobby.id, currentRound: round, categoryId: lobby.categoryId },
          lobby.players,
          target,
          "fr",
        )) ??
        (await resolveCurrentTurn(
          { id: lobby.id, currentRound: round, categoryId: lobby.categoryId },
          lobby.players,
          target,
          "en",
        ));
      if (!turn) continue;

      await tx.answer.upsert({
        where: { storyId_order: { storyId: turn.story.id, order: round + 1 } },
        update: {},
        create: {
          storyId: turn.story.id,
          questionId: turn.question.id,
          playerId: target.id,
          order: round + 1,
          text: "(left the game)",
          language: "fr",
        },
      });
    }

    let round = lobby.currentRound;
    while (round < lobby.totalQuestions) {
      const answersForRound = await tx.answer.count({
        where: { order: round + 1, story: { lobbyId: lobby.id } },
      });
      if (answersForRound < lobby.players.length) break;

      const nextRound = round + 1;
      await tx.lobby.updateMany({
        where: { id: lobby.id, currentRound: round },
        data: {
          currentRound: nextRound,
          status: nextRound >= lobby.totalQuestions ? "FINISHED" : "IN_PROGRESS",
        },
      });
      round = nextRound;
    }
  });

  const updatedLobby = await prisma.lobby.findUnique({
    where: { id: lobby.id },
    include: { players: true },
  });

  return NextResponse.json({ lobby: updatedLobby });
}
