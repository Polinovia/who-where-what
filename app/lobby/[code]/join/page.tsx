"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { joinLobby } from "@/lib/api-client";
import { savePlayerIdentity } from "@/lib/player-identity";
import { useLanguage } from "@/lib/i18n/language-context";

export default function JoinLobbyPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const [pseudoOverride, setPseudoOverride] = useState<string | null>(null);
  const pseudo = pseudoOverride ?? session?.user?.name ?? "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { lobby, player } = await joinLobby({ code, pseudo });
      savePlayerIdentity(lobby.code, { playerId: player.id, pseudo: player.pseudo });
      router.push(`/lobby/${lobby.code}`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : t.common.unexpectedError);
    }
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

        <h1 className="text-center font-[family-name:var(--font-marker)] text-3xl text-stone-900">
          {t.joinLobby.title}
        </h1>
        <p className="mt-2 text-center font-[family-name:var(--font-serif)] italic text-stone-600">
          {t.joinLobby.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <label className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-serif)] text-sm text-stone-600">
              {t.joinLobby.lobbyCode}
            </span>
            <input
              readOnly
              value={code.toUpperCase()}
              className="h-12 rounded-xl border border-stone-300 bg-stone-100 px-4 tracking-widest text-stone-800 outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-serif)] text-sm text-stone-600">
              {t.joinLobby.playerName}
            </span>
            <input
              required
              readOnly={!!session?.user?.name}
              value={pseudo}
              onChange={(e) => setPseudoOverride(e.target.value)}
              placeholder={t.joinLobby.yourPseudo}
              className={`h-12 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500 ${
                session?.user?.name ? "bg-stone-100" : ""
              }`}
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 rounded-xl bg-[#33261c] text-stone-50 transition-colors hover:bg-[#241a13] disabled:opacity-50"
          >
            {loading ? t.joinLobby.joining : t.joinLobby.joinLobby}
          </button>
        </form>
      </div>
    </div>
  );
}
