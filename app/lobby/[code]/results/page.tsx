"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { createLobby, getFinishedStories, getLobby, likeStory } from "@/lib/api-client";
import { getPlayerIdentity, getPlayerIdentitySnapshot, savePlayerIdentity, subscribePlayerIdentity } from "@/lib/player-identity";
import { useLanguage } from "@/lib/i18n/language-context";

function toSentence(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function ResultsPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const identity = useSyncExternalStore(
    subscribePlayerIdentity,
    () => getPlayerIdentitySnapshot(code),
    () => null,
  );

  const { data, isError } = useQuery({
    queryKey: ["stories", code, identity?.playerId, language],
    queryFn: () => getFinishedStories(code, identity!.playerId, language),
    enabled: !!identity,
  });

  const likeMutation = useMutation({
    mutationFn: (storyId: string) => likeStory(code, storyId, identity!.playerId),
    onSuccess: ({ likeCount, liked }, storyId) => {
      queryClient.setQueryData(
        ["stories", code, identity?.playerId, language],
        (current: typeof data) =>
          current && {
            stories: current.stories.map((story) =>
              story.id === storyId ? { ...story, likeCount, likedByMe: liked } : story,
            ),
          },
      );
    },
  });

  const { data: lobbyData } = useQuery({
    queryKey: ["lobby", code],
    queryFn: () => getLobby(code),
    enabled: !!identity,
  });

  const [playAgainError, setPlayAgainError] = useState<string | null>(null);

  const playAgainMutation = useMutation({
    mutationFn: () => {
      const lobby = lobbyData!.lobby;
      return createLobby({
        pseudo: identity!.pseudo,
        name: lobby.name ?? undefined,
        maxPlayers: lobby.maxPlayers,
        totalQuestions: lobby.totalQuestions,
        categoryId: lobby.categoryId ?? undefined,
        language: lobby.language as "fr" | "en",
      });
    },
    onSuccess: ({ lobby }) => {
      const player = lobby.players.find((p) => p.pseudo === identity!.pseudo)!;
      savePlayerIdentity(lobby.code, { playerId: player.id, pseudo: player.pseudo });
      router.push(`/lobby/${lobby.code}`);
    },
    onError: (err) => setPlayAgainError(err instanceof Error ? err.message : t.common.unexpectedError),
  });

  useEffect(() => {
    if (getPlayerIdentity(code) === null) {
      router.replace(`/lobby/${code}/join`);
    }
  }, [code, router]);

  if (!identity) return null;

  return (
    <div className="flex flex-1 items-center justify-center bg-[#e8e1d0] px-4 py-16">
      <div className="w-full max-w-2xl">
        <h1 className="text-center font-[family-name:var(--font-marker)] text-3xl text-stone-900">
          {t.results.title}
        </h1>

        {isError && (
          <p className="mt-4 text-center text-sm text-red-600">
            {t.results.notReady}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-6">
          {data?.stories.map((story) => (
            <div
              key={story.id}
              className="relative rounded-2xl bg-[#faf7f0] px-10 py-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)]"
            >
              <span
                aria-hidden
                className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
              />

              <p className="text-center font-[family-name:var(--font-serif)] text-sm text-stone-500">
                {t.results.storyOf(story.starterPlayer.pseudo)}
              </p>

              <p className="mt-4 font-[family-name:var(--font-serif)] leading-relaxed text-stone-800">
                {story.answers.map((answer) => `${toSentence(answer.text)}.`).join(" ")}
              </p>

              <button
                type="button"
                onClick={() => likeMutation.mutate(story.id)}
                disabled={likeMutation.isPending}
                className={`mt-6 flex items-center gap-1.5 border-t border-stone-200 pt-4 text-sm transition-colors disabled:opacity-50 ${
                  story.likedByMe ? "text-red-600" : "text-stone-400 hover:text-red-500"
                }`}
              >
                <Heart size={16} fill={story.likedByMe ? "currentColor" : "none"} />
                <span>{story.likeCount}</span>
              </button>
            </div>
          ))}
        </div>

        {playAgainError && (
          <p className="mt-4 text-center text-sm text-red-600">{playAgainError}</p>
        )}

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/"
            className="h-12 rounded-xl border border-stone-300 px-8 leading-[3rem] text-stone-700 transition-colors hover:bg-stone-100"
          >
            {t.results.backToHome}
          </Link>
          <button
            type="button"
            disabled={!lobbyData || playAgainMutation.isPending}
            onClick={() => playAgainMutation.mutate()}
            className="h-12 rounded-xl bg-[#33261c] px-8 text-stone-50 transition-colors hover:bg-[#241a13] disabled:opacity-50"
          >
            {playAgainMutation.isPending ? t.results.creating : t.results.playAgain}
          </button>
        </div>
      </div>
    </div>
  );
}
