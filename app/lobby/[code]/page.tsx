"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLobby, setReady, kickPlayer, startLobbyNow } from "@/lib/api-client";
import { getPlayerIdentity, getPlayerIdentitySnapshot, subscribePlayerIdentity } from "@/lib/player-identity";
import { useLanguage } from "@/lib/i18n/language-context";

export default function LobbyWaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identity = useSyncExternalStore(
    subscribePlayerIdentity,
    () => getPlayerIdentitySnapshot(code),
    () => null,
  );

  const { data } = useQuery({
    queryKey: ["lobby", code, language],
    queryFn: () => getLobby(code, language),
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
      setReady(code, { playerId: identity!.playerId, ready: nextReady }, language),
    onSuccess: ({ lobby }) => {
      queryClient.setQueryData(["lobby", code, language], { lobby });
    },
    onError: (err) => setError(err instanceof Error ? err.message : t.common.unexpectedError),
  });

  const kickMutation = useMutation({
    mutationFn: (targetPlayerId: string) =>
      kickPlayer(code, { requesterPlayerId: identity!.playerId, targetPlayerId }, language),
    onSuccess: ({ lobby }) => {
      queryClient.setQueryData(["lobby", code, language], { lobby });
    },
    onError: (err) => setError(err instanceof Error ? err.message : t.common.unexpectedError),
  });

  const startMutation = useMutation({
    mutationFn: () => startLobbyNow(code, { requesterPlayerId: identity!.playerId }, language),
    onSuccess: ({ lobby }) => {
      queryClient.setQueryData(["lobby", code, language], { lobby });
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
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#faf7f0] px-10 py-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] sm:px-16">
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
          <h1 className="mt-6 break-words text-center font-[family-name:var(--font-marker)] text-2xl leading-tight text-stone-900 sm:text-3xl">
            {lobby.name}
          </h1>
        )}

        {me?.isHost && (
          <div className="mt-8 flex flex-col items-center">
            <p className="font-[family-name:var(--font-serif)] text-2xl italic text-stone-900">
              {t.waitingRoom.lobbyCode}
            </p>
            <button
              type="button"
              onClick={copyCode}
              className="mt-3 border-b border-stone-800 pb-1 font-[family-name:var(--font-serif)] text-4xl text-stone-900 hover:text-stone-600"
            >
              {code.toLowerCase()}
            </button>
            <span className="mt-2 text-xs text-stone-400">
              {copied ? t.waitingRoom.copied : t.waitingRoom.tapToCopy}
            </span>
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-10">
          <div className="flex items-end justify-between border-b border-stone-800 pb-2">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl text-stone-900">
              {t.waitingRoom.players}
            </h2>
            <span className="font-[family-name:var(--font-serif)] text-2xl text-stone-900">
              {lobby?.players.length ?? 0}/{lobby?.maxPlayers ?? 0}
            </span>
          </div>

          <ul className="flex flex-col">
            {lobby?.players.map((player) => {
              const isSelf = player.id === me?.id;

              return (
                <li key={player.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        player.ready ? "bg-green-600" : "bg-stone-300"
                      }`}
                      aria-label={player.ready ? t.waitingRoom.readyLabel : t.waitingRoom.notReadyLabel}
                    />
                    <span className="font-[family-name:var(--font-serif)] text-lg text-stone-800">
                      {player.pseudo}
                      {isSelf && t.waitingRoom.you}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {me?.isHost && !isSelf && (
                      <button
                        type="button"
                        onClick={() => kickMutation.mutate(player.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        {t.waitingRoom.kick}
                      </button>
                    )}
                    {player.isHost && (
                      <span className="font-[family-name:var(--font-serif)] italic text-stone-500">
                        {t.waitingRoom.host}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => readyMutation.mutate(!me?.ready)}
          disabled={!me}
          className={`mx-auto mt-12 flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-xl border font-[family-name:var(--font-serif)] text-lg transition-colors disabled:opacity-50 ${
            me?.ready
              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-stone-300 bg-transparent text-stone-500 hover:bg-stone-100"
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
