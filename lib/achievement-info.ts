export type AchievementType = "FIRST_STORY" | "FIRST_FRIEND" | "ACCOMPLICE" | "STORY_LIKED";

export const ACCOMPLICE_THRESHOLD = 3;

export const ACHIEVEMENT_INFO: Record<
  AchievementType,
  { title: string; description: string; icon: string }
> = {
  FIRST_STORY: {
    title: "First story",
    description: "Finish your first game",
    icon: "📖",
  },
  FIRST_FRIEND: {
    title: "Made a friend",
    description: "Add your first friend",
    icon: "🤝",
  },
  ACCOMPLICE: {
    title: "Accomplice",
    description: `Finish ${ACCOMPLICE_THRESHOLD} games with the same friend`,
    icon: "🎭",
  },
  STORY_LIKED: {
    title: "Crowd favorite",
    description: "Get one of your stories liked",
    icon: "❤️",
  },
};
