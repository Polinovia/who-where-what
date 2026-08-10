export const POINTS_PER_GAME = 10;
export const POINTS_PER_LIKE = 2;
export const POINTS_PER_ACHIEVEMENT = 20;

// Cumulative points needed to *reach* level L, from 0 — grows by 10 more
// each level (level 1 = 10, level 2 = 30, level 3 = 60, level 4 = 100, ...),
// so leveling up gets progressively harder instead of costing a flat 10
// points forever.
function pointsForLevel(level: number): number {
  return 5 * level * (level + 1);
}

export function getLevel(points: number): number {
  let level = 0;
  while (pointsForLevel(level + 1) <= points) level++;
  return level;
}

export type LevelProgress = {
  level: number;
  pointsIntoLevel: number;
  pointsPerLevel: number;
};

export function getLevelProgress(points: number): LevelProgress {
  const level = getLevel(points);
  return {
    level,
    pointsIntoLevel: points - pointsForLevel(level),
    pointsPerLevel: pointsForLevel(level + 1) - pointsForLevel(level),
  };
}
