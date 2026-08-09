import { prisma } from "@/lib/db/prisma";
import { AchievementType } from "@/lib/generated/prisma/enums";
import {
  ACCOMPLICE_THRESHOLD,
  CROWD_PLEASER_THRESHOLD,
  SOCIAL_BUTTERFLY_THRESHOLD,
  STORYTELLER_THRESHOLD,
  WORDSMITH_THRESHOLD,
} from "@/lib/achievement-info";

export async function unlockAchievement(
  userId: string,
  type: AchievementType,
  relatedUserId = "",
) {
  try {
    await prisma.userAchievement.create({
      data: { userId, type, relatedUserId },
    });
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return;
    }
    throw err;
  }
}

// Called when a lobby transitions to FINISHED: unlocks "first story" for
// every registered player, then checks whether any pair of registered
// players has now shared enough finished games to unlock "accomplice".
export async function checkGameFinishedAchievements(lobbyId: string) {
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: { players: { where: { userId: { not: null } } } },
  });
  if (!lobby) return;

  const userIds = lobby.players.map((p) => p.userId!).filter(Boolean);
  if (userIds.length === 0) return;

  await Promise.all(
    userIds.map(async (userId) => {
      await unlockAchievement(userId, "FIRST_STORY");
      await checkStoryteller(userId);
      await checkWordsmith(userId);
    }),
  );

  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      await checkAccomplice(userIds[i], userIds[j]);
    }
  }
}

// Called after a friend is added: unlocks "social butterfly" once a user
// has enough friends.
export async function checkSocialButterflyAchievement(userId: string) {
  const friendsCount = await prisma.friendship.count({ where: { userId } });
  if (friendsCount >= SOCIAL_BUTTERFLY_THRESHOLD) {
    await unlockAchievement(userId, "SOCIAL_BUTTERFLY");
  }
}

// Called after a new like is recorded: unlocks "crowd favorite" for the
// story's starter, if they're a registered user.
export async function checkStoryLikedAchievement(storyId: string) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { starterPlayer: { select: { userId: true } } },
  });
  const userId = story?.starterPlayer.userId;
  if (!userId) return;

  await unlockAchievement(userId, "STORY_LIKED");
  await checkCrowdPleaser(userId);
}

async function checkStoryteller(userId: string) {
  const finishedGames = await prisma.lobby.count({
    where: { status: "FINISHED", players: { some: { userId } } },
  });
  if (finishedGames >= STORYTELLER_THRESHOLD) {
    await unlockAchievement(userId, "STORYTELLER");
  }
}

async function checkWordsmith(userId: string) {
  const answersWritten = await prisma.answer.count({
    where: { player: { userId } },
  });
  if (answersWritten >= WORDSMITH_THRESHOLD) {
    await unlockAchievement(userId, "WORDSMITH");
  }
}

async function checkCrowdPleaser(userId: string) {
  const likesReceived = await prisma.storyLike.count({
    where: { story: { starterPlayer: { userId } } },
  });
  if (likesReceived >= CROWD_PLEASER_THRESHOLD) {
    await unlockAchievement(userId, "CROWD_PLEASER");
  }
}

async function checkAccomplice(userIdA: string, userIdB: string) {
  const sharedFinishedLobbies = await prisma.lobby.count({
    where: {
      status: "FINISHED",
      AND: [
        { players: { some: { userId: userIdA } } },
        { players: { some: { userId: userIdB } } },
      ],
    },
  });

  if (sharedFinishedLobbies >= ACCOMPLICE_THRESHOLD) {
    await unlockAchievement(userIdA, "ACCOMPLICE", userIdB);
    await unlockAchievement(userIdB, "ACCOMPLICE", userIdA);
  }
}
