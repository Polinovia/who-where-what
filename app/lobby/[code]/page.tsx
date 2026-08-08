"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLobby, setReady, kickPlayer, addFriend } from "@/lib/api-client";
import { getPlayerIdentitySnapshot, subscribePlayerIdentity } from "@/lib/player-identity";

export default function LobbyWaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [copied, setCopied] = useState(false);
  const [addedFriendIds, setAddedFriendIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const identity = useSyncExternalStore(
    subscribePlayerIdentity,
    () => getPlayerIdentitySnapshot(code),
    () => null,
  );

  const { data } = useQuery({
    queryKey: ["lobby", code],
    queryFn: () => getLobby(code),
    enabled: !!identity,
    refetchInterval: 1500,
  });
  const lobby = data?.lobby;

  useEffect(() => {
    if (identity === null) {
      router.replace(`/lobby/${code}/join`);
    }
  }, [identity, code, router]);

  useEffect(() => {
    if (lobby?.status === "IN_PROGRESS") {
      router.push(`/lobby/${code}/play`);
    }
  }, [lobby?.status, code, router]);

  const readyMutation = useMutation({
    mutationFn: (nextReady: boolean) =>
      setReady(code, { playerId: identity!.playerId, ready: nextReady }),
    onSuccess: ({ lobby }) => {
      queryClient.setQueryData(["lobby", code], { lobby });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Erreur inattendue"),
  });

  const kickMutation = useMutation({
    mutationFn: (targetPlayerId: string) =>
      kickPlayer(code, { requesterPlayerId: identity!.playerId, targetPlayerId }),
    onSuccess: ({ lobby }) => {
      queryClient.setQueryData(["lobby", code], { lobby });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Erreur inattendue"),
  });

  const addFriendMutation = useMutation({
    mutationFn: (userId: string) => addFriend({ userId }),
    onSuccess: (_, userId) => {
      setAddedFriendIds((current) => [...current, userId]);
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Erreur inattendue"),
  });

  if (!identity) return null;

  const me = lobby?.players.find((p) => p.id === identity.playerId);

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[#e8e1d0] px-4 py-16">
      <div className="relative w-full max-w-md rounded-2xl bg-[#faf7f0] px-10 py-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)]">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
        />

        <Link
          href="/"
          aria-label="Quitter"
          className="absolute left-8 top-12 text-stone-700 hover:text-stone-900"
        >
          ←
        </Link>

        {lobby?.name && (
          <h1 className="text-center font-[family-name:var(--font-marker)] text-3xl text-stone-900">
            {lobby.name}
          </h1>
        )}

        {me?.isHost && (
          <div className="mt-6 flex flex-col items-center">
            <span className="font-[family-name:var(--font-serif)] text-xs uppercase tracking-[0.2em] text-stone-500">
              Lobby code
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="mt-1 flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-stone-100"
            >
              <span className="font-[family-name:var(--font-marker)] text-4xl tracking-[0.3em] text-stone-900">
                {code.toUpperCase()}
              </span>
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500"
              >
                {copied ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-600">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                    <rect x="7" y="7" width="10" height="10" rx="2" />
                    <path d="M4 13V5a2 2 0 0 1 2-2h8" />
                  </svg>
                )}
              </span>
            </button>
            <span className="text-xs text-stone-400">{copied ? "Copied!" : "Tap to copy"}</span>
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        <ul className="mt-8 flex flex-col gap-2">
          {lobby?.players.map((player) => {
            const isSelf = player.id === me?.id;
            const canAddFriend =
              !!session?.user?.id &&
              !isSelf &&
              !!player.userId &&
              player.userId !== session.user.id &&
              !addedFriendIds.includes(player.userId);

            return (
              <li
                key={player.id}
                className="flex items-center justify-between rounded-xl border border-stone-300 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-serif)] text-stone-800">
                    {player.pseudo}
                    {isSelf && " (you)"}
                  </span>
                  {player.isHost && (
                    <span className="text-xs text-stone-500">host</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {canAddFriend && (
                    <button
                      type="button"
                      onClick={() => addFriendMutation.mutate(player.userId!)}
                      className="text-sm text-stone-500 hover:text-stone-800"
                    >
                      + friend
                    </button>
                  )}
                  {me?.isHost && !isSelf && (
                    <button
                      type="button"
                      onClick={() => kickMutation.mutate(player.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      kick
                    </button>
                  )}
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      player.ready ? "bg-green-600" : "bg-stone-300"
                    }`}
                    aria-label={player.ready ? "Ready" : "Not ready"}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => readyMutation.mutate(!me?.ready)}
          disabled={!me}
          className={`mt-8 h-12 w-full rounded-xl text-lg transition-colors disabled:opacity-50 ${
            me?.ready
              ? "border border-stone-300 text-stone-800 hover:bg-stone-100"
              : "bg-[#33261c] text-stone-50 hover:bg-[#241a13]"
          }`}
        >
          {me?.ready ? "Not ready" : "Ready"}
        </button>

        <p className="mt-4 text-center font-[family-name:var(--font-serif)] italic text-sm text-stone-500">
          The story starts once everyone is ready.
        </p>
      </div>
    </div>
  );
}
