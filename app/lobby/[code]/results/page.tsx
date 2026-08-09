"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLobby, getFinishedStories, getLobby, likeStory } from "@/lib/api-client";
import { getPlayerIdentity, getPlayerIdentitySnapshot, savePlayerIdentity, subscribePlayerIdentity } from "@/lib/player-identity";

export default function ResultsPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const identity = useSyncExternalStore(
    subscribePlayerIdentity,
    () => getPlayerIdentitySnapshot(code),
    () => null,
  );

  const { data, isError } = useQuery({
    queryKey: ["stories", code, identity?.playerId],
    queryFn: () => getFinishedStories(code, identity!.playerId),
    enabled: !!identity,
  });

  const likeMutation = useMutation({
    mutationFn: (storyId: string) => likeStory(code, storyId, identity!.playerId),
    onSuccess: ({ likeCount, liked }, storyId) => {
      queryClient.setQueryData(
        ["stories", code, identity?.playerId],
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
    onError: (err) => setPlayAgainError(err instanceof Error ? err.message : "Erreur inattendue"),
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
          The stories
        </h1>

        {isError && (
          <p className="mt-4 text-center text-sm text-red-600">
            The stories aren&apos;t ready yet.
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
                {story.starterPlayer.pseudo}&apos;s story
              </p>

              <p className="mt-4 font-[family-name:var(--font-serif)] leading-relaxed text-stone-800">
                {story.answers.map((answer, i) => (
                  <span key={i}>
                    {i > 0 && " "}
                    {answer.text}
                  </span>
                ))}
              </p>

              <ul className="mt-6 flex flex-col gap-1 border-t border-stone-200 pt-4">
                {story.answers.map((answer, i) => (
                  <li key={i} className="text-xs text-stone-400">
                    <span className="italic">{answer.question.text}</span> — {answer.player.pseudo}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => likeMutation.mutate(story.id)}
                disabled={likeMutation.isPending}
                className={`mt-4 flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${
                  story.likedByMe ? "text-red-600" : "text-stone-400 hover:text-red-500"
                }`}
              >
                <span>{story.likedByMe ? "❤️" : "🤍"}</span>
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
            Back to home
          </Link>
          <button
            type="button"
            disabled={!lobbyData || playAgainMutation.isPending}
            onClick={() => playAgainMutation.mutate()}
            className="h-12 rounded-xl bg-[#33261c] px-8 text-stone-50 transition-colors hover:bg-[#241a13] disabled:opacity-50"
          >
            {playAgainMutation.isPending ? "Creating..." : "Play again"}
          </button>
        </div>
      </div>
    </div>
  );
}
