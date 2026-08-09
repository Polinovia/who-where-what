import { prisma } from "@/lib/db/prisma";
import { POINTS_PER_ACHIEVEMENT, POINTS_PER_GAME, POINTS_PER_LIKE } from "@/lib/player-level";

export async function computeUserPoints(userId: string): Promise<number> {
  const [gamesPlayed, likesReceived, achievementsCount] = await Promise.all([
    prisma.lobby.count({
      where: { status: "FINISHED", players: { some: { userId } } },
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
