import { prisma } from "@/lib/db/prisma";
import { seatOfStoryOwnerForWriter } from "@/lib/game/rotation";

type LobbyForTurn = {
  id: string;
  currentRound: number;
  categoryId: string | null;
  language: string;
};

type PlayerForTurn = {
  id: string;
  seat: number | null;
};

// Resolves which story + question a given player must write into for the
// lobby's current round, per the seat-rotation scheme in lib/game/rotation.ts.
export async function resolveCurrentTurn(
  lobby: LobbyForTurn,
  players: PlayerForTurn[],
  player: PlayerForTurn,
) {
  if (player.seat === null) return null;

  const round = lobby.currentRound;
  const ownerSeat = seatOfStoryOwnerForWriter(player.seat, round, players.length);
  const ownerPlayer = players.find((p) => p.seat === ownerSeat);
  if (!ownerPlayer) return null;

  const [story, question] = await Promise.all([
    prisma.story.findFirst({
      where: { lobbyId: lobby.id, starterPlayerId: ownerPlayer.id },
    }),
    lobby.categoryId
      ? prisma.question.findFirst({
          where: { categoryId: lobby.categoryId, language: lobby.language, order: round + 1 },
        })
      : null,
  ]);

  if (!story || !question) return null;

  return { round, story, question };
}
