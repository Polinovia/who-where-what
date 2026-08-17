"use client";

import { useEffect, useRef, useState } from "react";
import { ACHIEVEMENT_ICONS, THRESHOLDS, type AchievementType } from "@/lib/achievement-info";
import { useLanguage } from "@/lib/i18n/language-context";

const DISPLAY_MS = 4000;

/** Renders a stack of auto-dismissing toasts for newly unlocked achievements. `types` should be a fresh array each time new unlocks arrive (e.g. straight from an API response) — appending the same array reference twice is a no-op. */
export function AchievementToasts({ types }: { types: string[] }) {
  const { t } = useLanguage();
  const [queue, setQueue] = useState<{ id: number; type: string }[]>([]);
  const [seenTypes, setSeenTypes] = useState(types);
  const scheduled = useRef(new Set<number>());

  // Adjust state during render (React's recommended pattern for "a prop
  // changed, derive new state from it") instead of an effect, so a fresh
  // `types` array is enqueued exactly once without an extra render pass.
  if (types !== seenTypes) {
    setSeenTypes(types);
    if (types.length > 0) {
      setQueue((current) => [
        ...current,
        ...types.map((type, i) => ({ id: Date.now() + i, type })),
      ]);
    }
  }

  // Each toast gets its own independent dismiss timer starting the moment
  // it's added, so a batch of several unlocks all disappear ~DISPLAY_MS
  // later together instead of draining one-by-one every DISPLAY_MS.
  useEffect(() => {
    const timers = queue
      .filter((item) => !scheduled.current.has(item.id))
      .map((item) => {
        scheduled.current.add(item.id);
        return setTimeout(() => {
          scheduled.current.delete(item.id);
          setQueue((current) => current.filter((q) => q.id !== item.id));
        }, DISPLAY_MS);
      });
    return () => timers.forEach(clearTimeout);
  }, [queue]);

  if (queue.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
      {queue.map(({ id, type }) => {
        const Icon = ACHIEVEMENT_ICONS[type as AchievementType];
        const label = t.achievementInfo[type as AchievementType];
        if (!Icon || !label) return null;
        const threshold = THRESHOLDS[type as AchievementType];
        const description =
          typeof label.description === "function"
            ? label.description(threshold!)
            : label.description;

        return (
          <div
            key={id}
            className="flex items-center gap-3 rounded-xl border border-stone-300 bg-[#faf7f0] px-4 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]"
          >
            <Icon className="text-stone-700" size={22} />
            <div>
              <p className="font-[family-name:var(--font-serif)] text-sm text-stone-800">
                {label.title}
              </p>
              <p className="text-xs text-stone-500">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
