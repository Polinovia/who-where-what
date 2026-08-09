"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { listAchievements } from "@/lib/api-client";
import { ACHIEVEMENT_INFO } from "@/lib/achievement-info";

const ALL_TYPES = Object.keys(ACHIEVEMENT_INFO) as (keyof typeof ACHIEVEMENT_INFO)[];

export default function AchievementsPage() {
  const { data: session, status } = useSession();

  const { data: achievementsData } = useQuery({
    queryKey: ["achievements"],
    queryFn: listAchievements,
    enabled: !!session?.user,
  });

  const unlockedTypes = new Set(achievementsData?.achievements.map((a) => a.type));

  return (
    <div className="flex flex-1 items-center justify-center bg-[#e8e1d0] px-4 py-16">
      <div className="relative w-full max-w-md rounded-2xl bg-[#faf7f0] px-10 py-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)]">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
        />

        <Link
          href="/profile"
          aria-label="Back"
          className="absolute left-8 top-12 text-stone-700 hover:text-stone-900"
        >
          ←
        </Link>

        <h1 className="text-center font-[family-name:var(--font-marker)] text-3xl text-stone-900">
          Achievements
        </h1>

        {status !== "loading" && !session?.user ? (
          <p className="mt-8 text-center font-[family-name:var(--font-serif)] italic text-stone-600">
            <Link href="/login" className="underline hover:text-stone-900">
              Log in
            </Link>{" "}
            to see your achievements.
          </p>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {ALL_TYPES.map((type) => {
              const info = ACHIEVEMENT_INFO[type];
              const unlocked = unlockedTypes.has(type);
              return (
                <li
                  key={type}
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                    unlocked
                      ? "border-stone-300 bg-white"
                      : "border-stone-200 opacity-40 grayscale"
                  }`}
                >
                  <info.icon className="text-stone-700" size={24} />
                  <div>
                    <p className="font-[family-name:var(--font-serif)] text-stone-800">
                      {info.title}
                    </p>
                    <p className="text-sm text-stone-500">{info.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
