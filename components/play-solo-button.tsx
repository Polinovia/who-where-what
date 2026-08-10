"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createSoloLobby } from "@/lib/api-client";
import { savePlayerIdentity } from "@/lib/player-identity";
import { useLanguage } from "@/lib/i18n/language-context";

export function PlaySoloButton() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const pseudo = session?.user?.name ?? t.home.guestPseudo;
      const { lobby } = await createSoloLobby({ pseudo, language });
      const host = lobby.players.find((p) => p.isHost)!;
      savePlayerIdentity(lobby.code, { playerId: host.id, pseudo: host.pseudo });
      router.push(`/lobby/${lobby.code}/play`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : t.common.unexpectedError);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-stone-300 text-lg text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span aria-hidden>🤖</span>
        {t.home.playSolo}
      </button>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
