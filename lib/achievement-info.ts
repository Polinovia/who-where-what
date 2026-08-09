import { BookOpen, Drama, Handshake, Heart, type LucideIcon } from "lucide-react";

export type AchievementType = "FIRST_STORY" | "FIRST_FRIEND" | "ACCOMPLICE" | "STORY_LIKED";

export const ACCOMPLICE_THRESHOLD = 3;

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
};
