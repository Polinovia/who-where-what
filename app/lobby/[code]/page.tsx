"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLobby, setReady, kickPlayer, addFriend, startLobbyNow } from "@/lib/api-client";
import { getPlayerIdentity, getPlayerIdentitySnapshot, subscribePlayerIdentity } from "@/lib/player-identity";
import { useLanguage } from "@/lib/i18n/language-context";

export default function LobbyWaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

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
    if (getPlayerIdentity(code) === null) {
      router.replace(`/lobby/${code}/join`);
    }
  }, [code, router]);

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
    onError: (err) => setError(err instanceof Error ? err.message : t.common.unexpectedError),
  });

  const kickMutation = useMutation({
    mutationFn: (targetPlayerId: string) =>
      kickPlayer(code, { requesterPlayerId: identity!.playerId, targetPlayerId }),
    onSuccess: ({ lobby }) => {
      queryClient.setQueryData(["lobby", code], { lobby });
    },
    onError: (err) => setError(err instanceof Error ? err.message : t.common.unexpectedError),
  });

  const startMutation = useMutation({
    mutationFn: () => startLobbyNow(code, { requesterPlayerId: identity!.playerId }),
    onSuccess: ({ lobby }) => {
      queryClient.setQueryData(["lobby", code], { lobby });
    },
    onError: (err) => setError(err instanceof Error ? err.message : t.common.unexpectedError),
  });

  const addFriendMutation = useMutation({
    mutationFn: (userId: string) => addFriend({ userId }),
    onSuccess: (_, userId) => {
      setAddedFriendIds((current) => [...current, userId]);
    },
    onError: (err) => setError(err instanceof Error ? err.message : t.common.unexpectedError),
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
          aria-label={t.common.quit}
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
              {t.waitingRoom.lobbyCode}
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
            <span className="text-xs text-stone-400">
              {copied ? t.waitingRoom.copied : t.waitingRoom.tapToCopy}
            </span>
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        <ul className="mt-8 flex flex-col gap-2">
          {lobby?.players.map((player) => {
            const isSelf = player.id === me?.id;
            const isLoggedIn = !!session?.user?.id;
            const alreadyFriends =
              !!player.userId && addedFriendIds.includes(player.userId);
            const canAddFriend =
              isLoggedIn &&
              !isSelf &&
              !!player.userId &&
              player.userId !== session?.user?.id &&
              !alreadyFriends;

            return (
              <li
                key={player.id}
                className="flex items-center justify-between rounded-xl border border-stone-300 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-serif)] text-stone-800">
                    {player.pseudo}
                    {isSelf && t.waitingRoom.you}
                  </span>
                  {player.isHost && (
                    <span className="text-xs text-stone-500">{t.waitingRoom.host}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isSelf && player.userId && (
                    <button
                      type="button"
                      disabled={!isLoggedIn || alreadyFriends}
                      onClick={() => canAddFriend && addFriendMutation.mutate(player.userId!)}
                      title={
                        !isLoggedIn
                          ? t.waitingRoom.logInToAddFriends
                          : alreadyFriends
                            ? t.waitingRoom.friendAdded
                            : t.waitingRoom.addFriend
                      }
                      aria-label={
                        !isLoggedIn
                          ? t.waitingRoom.logInToAddFriends
                          : alreadyFriends
                            ? t.waitingRoom.friendAdded
                            : t.waitingRoom.addFriend
                      }
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm leading-none transition-colors ${
                        !isLoggedIn
                          ? "cursor-not-allowed border-stone-300 text-stone-400"
                          : alreadyFriends
                            ? "cursor-default border-green-600 bg-green-600 text-white"
                            : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      }`}
                    >
                      {alreadyFriends ? "✓" : "+"}
                    </button>
                  )}
                  {me?.isHost && !isSelf && (
                    <button
                      type="button"
                      onClick={() => kickMutation.mutate(player.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      {t.waitingRoom.kick}
                    </button>
                  )}
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      player.ready ? "bg-green-600" : "bg-amber-400"
                    }`}
                    aria-label={player.ready ? t.waitingRoom.readyLabel : t.waitingRoom.notReadyLabel}
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
          className={`mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-lg font-medium transition-colors disabled:opacity-50 ${
            me?.ready
              ? "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "bg-[#33261c] text-stone-50 hover:bg-[#241a13]"
          }`}
        >
          {me?.ready && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden />
          )}
          {me?.ready ? t.waitingRoom.waitingForOthers : t.waitingRoom.readyButton}
        </button>

        <p className="mt-4 text-center font-[family-name:var(--font-serif)] italic text-sm text-stone-500">
          {t.waitingRoom.storyStartsHint}
        </p>

        {me?.isHost && (lobby?.players.length ?? 0) >= 2 && (
          <button
            type="button"
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="mt-3 h-10 w-full rounded-xl border border-stone-300 text-sm text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-50"
          >
            {startMutation.isPending ? t.waitingRoom.starting : t.waitingRoom.startNow}
          </button>
        )}
      </div>
    </div>
  );
}
