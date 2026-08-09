export const POINTS_PER_GAME = 10;
export const POINTS_PER_LIKE = 2;
export const POINTS_PER_ACHIEVEMENT = 20;
export const POINTS_PER_LEVEL = 10;

export function getLevel(points: number): number {
  return Math.floor(points / POINTS_PER_LEVEL);
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
    pointsIntoLevel: points - level * POINTS_PER_LEVEL,
    pointsPerLevel: POINTS_PER_LEVEL,
  };
}
