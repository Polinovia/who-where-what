import { prisma } from "@/lib/db/prisma";
import { AchievementType } from "@/lib/generated/prisma/enums";
import {
  ACCOMPLICE_THRESHOLD,
  CROWD_PLEASER_THRESHOLD,
  EXPLORER_THRESHOLD,
  FAN_FAVORITE_THRESHOLD,
  FULL_HOUSE_THRESHOLD,
  GENEROUS_THRESHOLD,
  LEVEL_MILESTONES,
  NOVELIST_THRESHOLD,
  PARTY_PLANNER_THRESHOLD,
  POPULAR_THRESHOLD,
  SOCIAL_BUTTERFLY_THRESHOLD,
  STORYTELLER_THRESHOLD,
  VETERAN_THRESHOLD,
  WORDSMITH_THRESHOLD,
} from "@/lib/achievement-info";
import { computeUserPoints, finishedHumanGamesWhere } from "@/lib/db/points";
import { getLevel } from "@/lib/player-level";

const LEVEL_ACHIEVEMENT_TYPES = new Set(LEVEL_MILESTONES.map((m) => m.type));

// Unlocks every tier in `tiers` whose threshold `count` has reached — e.g.
// STORYTELLER at 10 finished games, then VETERAN at 25.
async function unlockTiers(
  userId: string,
  count: number,
  tiers: { threshold: number; type: AchievementType }[],
) {
  for (const tier of tiers) {
    if (count >= tier.threshold) {
      await unlockAchievement(userId, tier.type);
    }
  }
}

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

  // Every unlocked achievement is itself worth points, so re-check level
  // milestones — unless this unlock *is* a level milestone, to avoid
  // recursing into itself.
  if (!LEVEL_ACHIEVEMENT_TYPES.has(type as (typeof LEVEL_MILESTONES)[number]["type"])) {
    await checkLevelAchievements(userId);
  }
}

// Called any time a user's points may have changed (finishing a game,
// receiving a like, unlocking another achievement): unlocks the highest
// eligible level milestone achievements.
export async function checkLevelAchievements(userId: string) {
  for (const milestone of LEVEL_MILESTONES) {
    const points = await computeUserPoints(userId);
    if (getLevel(points) >= milestone.level) {
      await unlockAchievement(userId, milestone.type);
    }
  }
}

// Called when a lobby transitions to FINISHED: unlocks "first story" and
// game-completion milestones for every registered player, then checks
// whether any pair of registered players has now shared enough finished
// games to unlock "accomplice".
export async function checkGameFinishedAchievements(lobbyId: string) {
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: { players: true },
  });
  if (!lobby) return;

  // Solo games against bots don't count toward progression — see
  // finishedHumanGamesWhere.
  if (lobby.players.some((p) => p.isBot)) return;

  const userIds = lobby.players.map((p) => p.userId).filter((id): id is string => Boolean(id));
  if (userIds.length === 0) return;

  const hostUserIds = new Set(
    lobby.players.filter((p) => p.isHost).map((p) => p.userId).filter((id): id is string => Boolean(id)),
  );
  const fullHouse = lobby.players.length >= FULL_HOUSE_THRESHOLD;

  await Promise.all(
    userIds.map(async (userId) => {
      await unlockAchievement(userId, "FIRST_STORY");
      await checkStoryteller(userId);
      await checkWordsmith(userId);
      await checkExplorer(userId);
      if (fullHouse) await unlockAchievement(userId, "FULL_HOUSE");
      if (hostUserIds.has(userId)) await checkPartyPlanner(userId);
      await checkLevelAchievements(userId);
    }),
  );

  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      await checkAccomplice(userIds[i], userIds[j]);
    }
  }
}

// Called after a friend is added: unlocks "social butterfly"/"popular" once
// a user has enough friends.
export async function checkSocialButterflyAchievement(userId: string) {
  const friendsCount = await prisma.friendship.count({ where: { userId } });
  await unlockTiers(userId, friendsCount, [
    { threshold: SOCIAL_BUTTERFLY_THRESHOLD, type: "SOCIAL_BUTTERFLY" },
    { threshold: POPULAR_THRESHOLD, type: "POPULAR" },
  ]);
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
  await checkLevelAchievements(userId);
}

// Called after a new like is recorded: unlocks "generous" once the liker
// (not the story's starter) has liked enough stories.
export async function checkGenerousAchievement(userId: string) {
  const likesGiven = await prisma.storyLike.count({ where: { player: { userId } } });
  if (likesGiven >= GENEROUS_THRESHOLD) {
    await unlockAchievement(userId, "GENEROUS");
  }
}

async function checkStoryteller(userId: string) {
  const finishedGames = await prisma.lobby.count({
    where: finishedHumanGamesWhere(userId),
  });
  await unlockTiers(userId, finishedGames, [
    { threshold: STORYTELLER_THRESHOLD, type: "STORYTELLER" },
    { threshold: VETERAN_THRESHOLD, type: "VETERAN" },
  ]);
}

async function checkWordsmith(userId: string) {
  const answersWritten = await prisma.answer.count({
    where: { player: { userId }, story: { lobby: { players: { none: { isBot: true } } } } },
  });
  await unlockTiers(userId, answersWritten, [
    { threshold: WORDSMITH_THRESHOLD, type: "WORDSMITH" },
    { threshold: NOVELIST_THRESHOLD, type: "NOVELIST" },
  ]);
}

async function checkCrowdPleaser(userId: string) {
  const likesReceived = await prisma.storyLike.count({
    where: { story: { starterPlayer: { userId } } },
  });
  await unlockTiers(userId, likesReceived, [
    { threshold: CROWD_PLEASER_THRESHOLD, type: "CROWD_PLEASER" },
    { threshold: FAN_FAVORITE_THRESHOLD, type: "FAN_FAVORITE" },
  ]);
}

// Called when a lobby a user hosted finishes: unlocks "party planner" once
// they've hosted enough finished games.
async function checkPartyPlanner(userId: string) {
  const hostedGames = await prisma.lobby.count({
    where: {
      status: "FINISHED",
      players: { some: { userId, isHost: true }, none: { isBot: true } },
    },
  });
  if (hostedGames >= PARTY_PLANNER_THRESHOLD) {
    await unlockAchievement(userId, "PARTY_PLANNER");
  }
}

// Called when a lobby finishes: unlocks "explorer" once a user has finished
// games across enough distinct categories.
async function checkExplorer(userId: string) {
  const categories = await prisma.lobby.findMany({
    where: { ...finishedHumanGamesWhere(userId), categoryId: { not: null } },
    select: { categoryId: true },
    distinct: ["categoryId"],
  });
  if (categories.length >= EXPLORER_THRESHOLD) {
    await unlockAchievement(userId, "EXPLORER");
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
