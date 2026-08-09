import {
  BookOpen,
  Drama,
  Feather,
  Handshake,
  Heart,
  Library,
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
  | "WORDSMITH";

export const ACCOMPLICE_THRESHOLD = 3;
export const STORYTELLER_THRESHOLD = 10;
export const SOCIAL_BUTTERFLY_THRESHOLD = 5;
export const CROWD_PLEASER_THRESHOLD = 10;
export const WORDSMITH_THRESHOLD = 50;

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
};
