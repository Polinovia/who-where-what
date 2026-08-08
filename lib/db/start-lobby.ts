import type { Prisma } from "@/lib/generated/prisma/client";

type TxPlayer = { id: string; joinedAt: Date };

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

  return tx.lobby.update({
    where: { id: lobbyId },
    data: { status: "IN_PROGRESS", currentRound: 0 },
    include: { players: true, stories: true },
  });
}
