"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentQuestion, submitAnswer } from "@/lib/api-client";
import { getPlayerIdentity, getPlayerIdentitySnapshot, subscribePlayerIdentity } from "@/lib/player-identity";

export default function PlayPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [text, setText] = useState("");
  const [submittedRound, setSubmittedRound] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderedRound, setRenderedRound] = useState<number | null>(null);

  const identity = useSyncExternalStore(
    subscribePlayerIdentity,
    () => getPlayerIdentitySnapshot(code),
    () => null,
  );

  const { data } = useQuery({
    queryKey: ["question", code, identity?.playerId],
    queryFn: () => getCurrentQuestion(code, identity!.playerId),
    enabled: !!identity,
    refetchInterval: 1500,
  });

  useEffect(() => {
    if (getPlayerIdentity(code) === null) {
      router.replace(`/lobby/${code}/join`);
    }
  }, [code, router]);

  useEffect(() => {
    if (data?.status === "finished") {
      router.push(`/lobby/${code}/results`);
    }
  }, [data?.status, code, router]);

  if (data?.status === "answer" && data.round !== renderedRound) {
    setRenderedRound(data.round);
    setText("");
  }

  const submitMutation = useMutation({
    mutationFn: () => {
      if (data?.status !== "answer") throw new Error("Erreur inattendue");
      return submitAnswer(code, { playerId: identity!.playerId, text });
    },
    onSuccess: () => {
      if (data?.status === "answer") setSubmittedRound(data.round);
      queryClient.invalidateQueries({ queryKey: ["question", code, identity?.playerId] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Erreur inattendue"),
  });

  if (!identity || !data) return null;

  const isWaiting =
    data.status === "waiting" || (data.status === "answer" && data.round === submittedRound);

  const round = data.status === "finished" ? null : data.round;
  const totalQuestions = data.status === "finished" ? null : data.totalQuestions;

  return (
    <div className="flex flex-1 items-center justify-center bg-[#e8e1d0] px-4 py-16">
      <div className="relative w-full max-w-md rounded-2xl bg-[#faf7f0] px-10 py-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)]">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
        />

        {round !== null && totalQuestions !== null && (
          <p className="text-center font-[family-name:var(--font-serif)] text-sm text-stone-500">
            Question {round + 1} / {totalQuestions}
          </p>
        )}

        {isWaiting ? (
          <>
            <h1 className="mt-4 text-center font-[family-name:var(--font-marker)] text-2xl text-stone-900">
              Waiting for the others...
            </h1>
            <p className="mt-2 text-center font-[family-name:var(--font-serif)] italic text-stone-600">
              The story continues once everyone has answered.
            </p>
          </>
        ) : data.status === "answer" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              submitMutation.mutate();
            }}
            className="mt-4 flex flex-col gap-6"
          >
            <h1 className="text-center font-[family-name:var(--font-marker)] text-2xl text-stone-900">
              {data.question.text}
            </h1>

            <textarea
              required
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={120}
              rows={3}
              placeholder="Your answer"
              className="resize-none rounded-xl border border-stone-300 px-4 py-3 text-stone-800 outline-none focus:border-stone-500"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="h-12 rounded-xl bg-[#33261c] text-stone-50 transition-colors hover:bg-[#241a13] disabled:opacity-50"
            >
              {submitMutation.isPending ? "Sending..." : "Submit"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
