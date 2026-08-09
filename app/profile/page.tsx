"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, listAchievements, updateProfile } from "@/lib/api-client";
import { ACHIEVEMENT_INFO } from "@/lib/achievement-info";

const ALL_TYPES = Object.keys(ACHIEVEMENT_INFO) as (keyof typeof ACHIEVEMENT_INFO)[];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !!session?.user,
  });

  const { data: achievementsData } = useQuery({
    queryKey: ["achievements"],
    queryFn: listAchievements,
    enabled: !!session?.user,
  });

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: () => updateProfile({ bio, avatarUrl }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(["profile"], { user });
      setEditing(false);
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Erreur inattendue"),
  });

  const unlockedTypes = new Set(achievementsData?.achievements.map((a) => a.type));
  const user = profileData?.user;

  return (
    <div className="flex flex-1 items-center justify-center bg-[#e8e1d0] px-4 py-16">
      <div className="relative w-full max-w-md rounded-2xl bg-[#faf7f0] px-10 py-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)]">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
        />

        <Link
          href="/"
          aria-label="Back"
          className="absolute left-8 top-12 text-stone-700 hover:text-stone-900"
        >
          ←
        </Link>

        <h1 className="text-center font-[family-name:var(--font-marker)] text-3xl text-stone-900">
          Profile
        </h1>

        {status !== "loading" && !session?.user ? (
          <p className="mt-8 text-center font-[family-name:var(--font-serif)] italic text-stone-600">
            <Link href="/login" className="underline hover:text-stone-900">
              Log in
            </Link>{" "}
            to see your profile.
          </p>
        ) : user ? (
          <>
            <div className="mt-6 flex flex-col items-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-full border border-stone-300 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-stone-300 bg-stone-200 font-[family-name:var(--font-marker)] text-2xl text-stone-600">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              )}

              <p className="mt-3 font-[family-name:var(--font-serif)] text-lg text-stone-800">
                {user.name}
              </p>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(user.playerCode).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="mt-1 rounded-full border border-stone-300 px-3 py-1 text-xs tracking-wide text-stone-500 hover:bg-stone-100"
                title="Copy player ID"
              >
                ID: {user.playerCode} {copied ? "✓" : ""}
              </button>
            </div>

            {editing ? (
              <div className="mt-6 flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="font-[family-name:var(--font-serif)] text-sm text-stone-600">
                    Avatar URL
                  </span>
                  <input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-11 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-[family-name:var(--font-serif)] text-sm text-stone-600">
                    Bio
                  </span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={280}
                    rows={3}
                    placeholder="Tell your friends about yourself"
                    className="rounded-xl border border-stone-300 px-4 py-2 text-stone-800 outline-none focus:border-stone-500"
                  />
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="h-11 flex-1 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={updateProfileMutation.isPending}
                    onClick={() => {
                      setError(null);
                      updateProfileMutation.mutate();
                    }}
                    className="h-11 flex-1 rounded-xl bg-[#33261c] text-stone-50 transition-colors hover:bg-[#241a13] disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-center font-[family-name:var(--font-serif)] italic text-stone-600">
                  {user.bio || "No bio yet."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBio(user.bio ?? "");
                    setAvatarUrl(user.avatarUrl ?? "");
                    setEditing(true);
                  }}
                  className="text-sm text-stone-500 underline hover:text-stone-800"
                >
                  Edit profile
                </button>
              </div>
            )}

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
                    <span className="text-2xl">{info.icon}</span>
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
          </>
        ) : null}
      </div>
    </div>
  );
}
