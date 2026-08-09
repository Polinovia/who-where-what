export type PlayerLevel = { title: string; icon: string };

const LEVELS: { minGames: number; title: string; icon: string }[] = [
  { minGames: 10, title: "Veteran", icon: "🏆" },
  { minGames: 3, title: "Regular", icon: "⭐" },
  { minGames: 0, title: "Beginner", icon: "🌱" },
];

export function getPlayerLevel(gamesPlayed: number): PlayerLevel {
  const level = LEVELS.find((l) => gamesPlayed >= l.minGames)!;
  return { title: level.title, icon: level.icon };
}
