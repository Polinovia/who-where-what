import { prisma } from "@/lib/db/prisma";
import { POINTS_PER_ACHIEVEMENT, POINTS_PER_GAME, POINTS_PER_LIKE } from "@/lib/player-level";

// Solo games against bots are instant and free to repeat, so they're
// excluded from every progression query — otherwise spamming "Play solo"
// would let anyone farm points and achievements for free.
export function finishedHumanGamesWhere(userId: string) {
  return {
    status: "FINISHED" as const,
    players: { some: { userId }, none: { isBot: true } },
  };
}

export async function computeUserPoints(userId: string): Promise<number> {
  const [gamesPlayed, likesReceived, achievementsCount] = await Promise.all([
    prisma.lobby.count({
      where: finishedHumanGamesWhere(userId),
    }),
    prisma.storyLike.count({
      where: { story: { starterPlayer: { userId } } },
    }),
    prisma.userAchievement.count({ where: { userId } }),
  ]);

  return (
    gamesPlayed * POINTS_PER_GAME +
    likesReceived * POINTS_PER_LIKE +
    achievementsCount * POINTS_PER_ACHIEVEMENT
  );
}
