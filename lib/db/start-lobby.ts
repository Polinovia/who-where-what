import type { Prisma } from "@/lib/generated/prisma/client";
import { submitBotAnswers } from "@/lib/db/bots";

type TxPlayer = { id: string; joinedAt: Date; isBot: boolean; kicked: boolean };

// Seats players by join order, gives every player a Story, and flips the
// lobby into IN_PROGRESS at round 0. Caller must already hold `tx` inside a
// transaction and have verified the lobby is still in LOBBY status.
export async function startLobby(
  tx: Prisma.TransactionClient,
  lobbyId: string,
  players: TxPlayer[],
) {
  const seatedPlayers = [...players].sort(
    (a, b) => a.joinedAt.getTime() - b.joinedAt.getTime(),
  );

  await Promise.all(
    seatedPlayers.map((player, seat) =>
      tx.player.update({ where: { id: player.id }, data: { seat } }),
    ),
  );

  await tx.story.createMany({
    data: seatedPlayers.map((player) => ({
      lobbyId,
      starterPlayerId: player.id,
    })),
  });

  const updatedLobby = await tx.lobby.update({
    where: { id: lobbyId },
    data: { status: "IN_PROGRESS", currentRound: 0 },
    include: { players: true, stories: true },
  });

  await submitBotAnswers(
    tx,
    updatedLobby,
    seatedPlayers.map((player, seat) => ({ ...player, seat })),
    0,
  );

  return updatedLobby;
}
