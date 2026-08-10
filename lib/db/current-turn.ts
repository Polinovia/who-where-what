import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { seatOfStoryOwnerForWriter } from "@/lib/game/rotation";

type LobbyForTurn = {
  id: string;
  currentRound: number;
  categoryId: string | null;
};

type PlayerForTurn = {
  id: string;
  seat: number | null;
};

// Resolves which story + question a given player must write into for the
// lobby's current round, per the seat-rotation scheme in lib/game/rotation.ts.
// `language` is the viewer's own UI language, not a lobby-wide setting — each
// player sees the question text in whichever language they understand.
// `db` defaults to the plain client, but callers resolving a turn for rows
// created earlier in an still-open transaction (e.g. bots answering round 0
// right after startLobby creates their stories) must pass that `tx` instead,
// or the read won't see the uncommitted rows.
export async function resolveCurrentTurn(
  lobby: LobbyForTurn,
  players: PlayerForTurn[],
  player: PlayerForTurn,
  language: string,
  db: Prisma.TransactionClient = prisma,
) {
  if (player.seat === null) return null;

  const round = lobby.currentRound;
  const ownerSeat = seatOfStoryOwnerForWriter(player.seat, round, players.length);
  const ownerPlayer = players.find((p) => p.seat === ownerSeat);
  if (!ownerPlayer) return null;

  const [story, question] = await Promise.all([
    db.story.findFirst({
      where: { lobbyId: lobby.id, starterPlayerId: ownerPlayer.id },
    }),
    lobby.categoryId
      ? db.question.findFirst({
          where: { categoryId: lobby.categoryId, language, order: round + 1 },
        })
      : null,
  ]);

  if (!story || !question) return null;

  return { round, story, question };
}
