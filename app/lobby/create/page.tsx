"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { createLobby, listCategories } from "@/lib/api-client";
import { savePlayerIdentity } from "@/lib/player-identity";

const QUESTION_PRESETS = [8, 10, 12] as const;

export default function CreateLobbyPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [pseudoOverride, setPseudoOverride] = useState<string | null>(null);
  const pseudo = pseudoOverride ?? session?.user?.name ?? "";
  const [name, setName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [totalQuestions, setTotalQuestions] = useState<number>(8);
  const [customQuestions, setCustomQuestions] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listCategories()
      .then(({ categories }) => {
        setCategories(categories);
        setCategoryId((current) => current || categories[0]?.id || "");
      })
      .catch(() => {
        // Categories are optional at submit time; the API falls back to "Classic".
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { lobby } = await createLobby({
        pseudo,
        name: name || undefined,
        maxPlayers,
        totalQuestions,
        categoryId: categoryId || undefined,
      });

      const host = lobby.players.find((p) => p.isHost) ?? lobby.players[0];
      if (host) {
        savePlayerIdentity(lobby.code, { playerId: host.id, pseudo: host.pseudo });
      }

      router.push(`/lobby/${lobby.code}`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Erreur inattendue");
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
          aria-label="Quitter"
          className="absolute left-8 top-12 text-stone-700 hover:text-stone-900"
        >
          ←
        </Link>

        <h1 className="text-center font-[family-name:var(--font-marker)] text-3xl text-stone-900">
          Create lobby
        </h1>
        <p className="mt-2 text-center font-[family-name:var(--font-serif)] italic text-stone-600">
          Set up your story before you invite friends.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <label className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-serif)] text-sm text-stone-600">
              Player Name
            </span>
            <input
              required
              readOnly={!!session?.user?.name}
              value={pseudo}
              onChange={(e) => setPseudoOverride(e.target.value)}
              placeholder="Your pseudo"
              className={`h-12 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500 ${
                session?.user?.name ? "bg-stone-100" : ""
              }`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-serif)] text-sm text-stone-600">
              Game Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              className="h-12 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-serif)] text-sm text-stone-600">
              Number Of Players
            </span>
            <div className="flex h-12 items-center justify-between rounded-xl border border-stone-300 px-4">
              <button
                type="button"
                onClick={() => setMaxPlayers((n) => Math.max(2, n - 1))}
                className="text-xl text-stone-500 hover:text-stone-900"
                aria-label="Moins de joueurs"
              >
                −
              </button>
              <span className="text-stone-800">{maxPlayers}</span>
              <button
                type="button"
                onClick={() => setMaxPlayers((n) => Math.min(12, n + 1))}
                className="text-xl text-stone-500 hover:text-stone-900"
                aria-label="Plus de joueurs"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-serif)] text-sm text-stone-600">
              Number Of Questions
            </span>
            <div className="flex gap-2">
              {QUESTION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setCustomQuestions(false);
                    setTotalQuestions(preset);
                  }}
                  className={`h-11 flex-1 rounded-xl border transition-colors ${
                    !customQuestions && totalQuestions === preset
                      ? "border-stone-800 bg-stone-800 text-stone-50"
                      : "border-stone-300 text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCustomQuestions(true)}
                className={`h-11 flex-1 rounded-xl border transition-colors ${
                  customQuestions
                    ? "border-stone-800 bg-stone-800 text-stone-50"
                    : "border-stone-300 text-stone-800 hover:bg-stone-100"
                }`}
              >
                Custom
              </button>
            </div>
            {customQuestions && (
              <input
                type="number"
                min={4}
                max={20}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="mt-2 h-12 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500"
              />
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-serif)] text-sm text-stone-600">
              Category
            </span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-12 rounded-xl border border-stone-300 bg-[#faf7f0] px-4 text-stone-800 outline-none focus:border-stone-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 rounded-xl bg-[#33261c] text-stone-50 transition-colors hover:bg-[#241a13] disabled:opacity-50"
          >
            {loading ? "Création..." : "Create lobby"}
          </button>
        </form>
      </div>
    </div>
  );
}
