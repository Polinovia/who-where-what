import {
  Award,
  BookOpen,
  Compass,
  Crown,
  Drama,
  Feather,
  Flame,
  Gem,
  Gift,
  Handshake,
  Heart,
  Library,
  Medal,
  PartyPopper,
  ScrollText,
  Sparkles,
  Star,
  Trophy,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type AchievementType =
  | "FIRST_STORY"
  | "FIRST_FRIEND"
  | "ACCOMPLICE"
  | "STORY_LIKED"
  | "STORYTELLER"
  | "SOCIAL_BUTTERFLY"
  | "CROWD_PLEASER"
  | "WORDSMITH"
  | "GENEROUS"
  | "VETERAN"
  | "NOVELIST"
  | "FAN_FAVORITE"
  | "POPULAR"
  | "PARTY_PLANNER"
  | "EXPLORER"
  | "FULL_HOUSE"
  | "LEVEL_10"
  | "LEVEL_30"
  | "LEVEL_50"
  | "LEVEL_100";

export const ACCOMPLICE_THRESHOLD = 3;
export const STORYTELLER_THRESHOLD = 10;
export const VETERAN_THRESHOLD = 25;
export const SOCIAL_BUTTERFLY_THRESHOLD = 5;
export const POPULAR_THRESHOLD = 10;
export const CROWD_PLEASER_THRESHOLD = 10;
export const FAN_FAVORITE_THRESHOLD = 25;
export const WORDSMITH_THRESHOLD = 50;
export const NOVELIST_THRESHOLD = 150;
export const GENEROUS_THRESHOLD = 5;
export const PARTY_PLANNER_THRESHOLD = 10;
export const EXPLORER_THRESHOLD = 5;
export const FULL_HOUSE_THRESHOLD = 12;

// Level milestones that unlock a bonus achievement, in ascending order.
export const LEVEL_MILESTONES: { level: number; type: AchievementType }[] = [
  { level: 10, type: "LEVEL_10" },
  { level: 30, type: "LEVEL_30" },
  { level: 50, type: "LEVEL_50" },
  { level: 100, type: "LEVEL_100" },
];

// Threshold for each achievement type whose translated description is a
// function taking a number (e.g. "Finish 3 games with the same friend").
export const THRESHOLDS: Partial<Record<AchievementType, number>> = {
  ACCOMPLICE: ACCOMPLICE_THRESHOLD,
  STORYTELLER: STORYTELLER_THRESHOLD,
  VETERAN: VETERAN_THRESHOLD,
  SOCIAL_BUTTERFLY: SOCIAL_BUTTERFLY_THRESHOLD,
  POPULAR: POPULAR_THRESHOLD,
  CROWD_PLEASER: CROWD_PLEASER_THRESHOLD,
  FAN_FAVORITE: FAN_FAVORITE_THRESHOLD,
  WORDSMITH: WORDSMITH_THRESHOLD,
  NOVELIST: NOVELIST_THRESHOLD,
  GENEROUS: GENEROUS_THRESHOLD,
  PARTY_PLANNER: PARTY_PLANNER_THRESHOLD,
  EXPLORER: EXPLORER_THRESHOLD,
};

export const ACHIEVEMENT_ICONS: Record<AchievementType, LucideIcon> = {
  FIRST_STORY: BookOpen,
  FIRST_FRIEND: Handshake,
  ACCOMPLICE: Drama,
  STORY_LIKED: Heart,
  STORYTELLER: Library,
  SOCIAL_BUTTERFLY: Users,
  CROWD_PLEASER: Sparkles,
  WORDSMITH: Feather,
  GENEROUS: Gift,
  VETERAN: Trophy,
  NOVELIST: ScrollText,
  FAN_FAVORITE: Flame,
  POPULAR: Star,
  PARTY_PLANNER: PartyPopper,
  EXPLORER: Compass,
  FULL_HOUSE: UsersRound,
  LEVEL_10: Medal,
  LEVEL_30: Award,
  LEVEL_50: Crown,
  LEVEL_100: Gem,
};
