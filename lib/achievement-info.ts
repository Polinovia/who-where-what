import {
  Award,
  BookOpen,
  Crown,
  Drama,
  Feather,
  Gem,
  Handshake,
  Heart,
  Library,
  Medal,
  Sparkles,
  Users,
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
  | "LEVEL_10"
  | "LEVEL_30"
  | "LEVEL_50"
  | "LEVEL_100";

export const ACCOMPLICE_THRESHOLD = 3;
export const STORYTELLER_THRESHOLD = 10;
export const SOCIAL_BUTTERFLY_THRESHOLD = 5;
export const CROWD_PLEASER_THRESHOLD = 10;
export const WORDSMITH_THRESHOLD = 50;

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
  SOCIAL_BUTTERFLY: SOCIAL_BUTTERFLY_THRESHOLD,
  CROWD_PLEASER: CROWD_PLEASER_THRESHOLD,
  WORDSMITH: WORDSMITH_THRESHOLD,
};

export const ACHIEVEMENT_INFO: Record<
  AchievementType,
  { title: string; description: string; icon: LucideIcon }
> = {
  FIRST_STORY: {
    title: "First story",
    description: "Finish your first game",
    icon: BookOpen,
  },
  FIRST_FRIEND: {
    title: "Made a friend",
    description: "Add your first friend",
    icon: Handshake,
  },
  ACCOMPLICE: {
    title: "Accomplice",
    description: `Finish ${ACCOMPLICE_THRESHOLD} games with the same friend`,
    icon: Drama,
  },
  STORY_LIKED: {
    title: "Crowd favorite",
    description: "Get one of your stories liked",
    icon: Heart,
  },
  STORYTELLER: {
    title: "Storyteller",
    description: `Finish ${STORYTELLER_THRESHOLD} games`,
    icon: Library,
  },
  SOCIAL_BUTTERFLY: {
    title: "Social butterfly",
    description: `Add ${SOCIAL_BUTTERFLY_THRESHOLD} friends`,
    icon: Users,
  },
  CROWD_PLEASER: {
    title: "Crowd pleaser",
    description: `Get ${CROWD_PLEASER_THRESHOLD} likes on your stories`,
    icon: Sparkles,
  },
  WORDSMITH: {
    title: "Wordsmith",
    description: `Write ${WORDSMITH_THRESHOLD} answers`,
    icon: Feather,
  },
  LEVEL_10: {
    title: "Rising star",
    description: "Reach level 10",
    icon: Medal,
  },
  LEVEL_30: {
    title: "Seasoned",
    description: "Reach level 30",
    icon: Award,
  },
  LEVEL_50: {
    title: "Master storyteller",
    description: "Reach level 50",
    icon: Crown,
  },
  LEVEL_100: {
    title: "Legend",
    description: "Reach level 100",
    icon: Gem,
  },
};
