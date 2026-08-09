import { Sprout, Star, Trophy, type LucideIcon } from "lucide-react";

export type PlayerLevel = { title: string; icon: LucideIcon };

const LEVELS: { minGames: number; title: string; icon: LucideIcon }[] = [
  { minGames: 10, title: "Veteran", icon: Trophy },
  { minGames: 3, title: "Regular", icon: Star },
  { minGames: 0, title: "Beginner", icon: Sprout },
];

export function getPlayerLevel(gamesPlayed: number): PlayerLevel {
  const level = LEVELS.find((l) => gamesPlayed >= l.minGames)!;
  return { title: level.title, icon: level.icon };
}
