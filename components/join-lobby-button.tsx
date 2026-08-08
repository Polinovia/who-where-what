"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinLobbyButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) return;
    router.push(`/lobby/${trimmed}/join`);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-stone-300 text-lg text-stone-700 transition-colors hover:bg-stone-100"
      >
        <span aria-hidden>➝</span>
        Join lobby
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={6}
        placeholder="CODE"
        className="h-14 flex-1 rounded-xl border border-stone-300 px-4 text-center text-lg tracking-[0.3em] text-stone-800 uppercase outline-none focus:border-stone-500"
      />
      <button
        type="submit"
        disabled={code.trim().length !== 6}
        className="h-14 rounded-xl bg-[#33261c] px-6 text-lg text-stone-50 transition-colors hover:bg-[#241a13] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Go
      </button>
    </form>
  );
}
