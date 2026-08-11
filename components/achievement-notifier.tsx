"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getUnseenAchievements } from "@/lib/api-client";
import { AchievementToasts } from "@/components/achievement-toast";

const POLL_MS = 10000;

// App-wide poller for achievements unlocked passively — e.g. a friend adds
// you, or someone likes a story you wrote while you're elsewhere in the app.
// Some flows (finishing a game, adding a friend yourself) already check
// right after the action for instant feedback; this catches everything else
// within POLL_MS, wherever the user happens to be.
export function AchievementNotifier() {
  const { data: session } = useSession();

  const { data } = useQuery({
    queryKey: ["achievements", "unseen"],
    queryFn: getUnseenAchievements,
    enabled: !!session?.user,
    refetchInterval: POLL_MS,
  });

  return <AchievementToasts types={data?.achievements.map((a) => a.type) ?? []} />;
}
