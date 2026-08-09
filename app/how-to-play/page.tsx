import Link from "next/link";

export default function HowToPlayPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#e8e1d0] px-4 py-16">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#faf7f0] px-10 py-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] sm:px-16">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
        />

        <Link
          href="/"
          aria-label="Back"
          className="absolute left-8 top-12 text-stone-700 hover:text-stone-900"
        >
          ←
        </Link>

        <h1 className="text-center font-[family-name:var(--font-marker)] text-4xl text-stone-900">
          How to play
        </h1>
        <p className="mt-2 text-center font-[family-name:var(--font-serif)] italic text-stone-600">
          A classic &ldquo;exquisite corpse&rdquo; story game, 2 to 12 players.
        </p>

        <div className="mt-10 flex flex-col gap-6 font-[family-name:var(--font-serif)] text-stone-700">
          <section>
            <h2 className="font-[family-name:var(--font-marker)] text-xl text-stone-900">
              1. Gather your friends
            </h2>
            <p className="mt-1">
              One player creates a lobby, picks a question category and how
              many rounds to play, then shares the lobby code. Everyone else
              joins with that code and a name.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-marker)] text-xl text-stone-900">
              2. Ready up
            </h2>
            <p className="mt-1">
              Once everyone has marked themselves ready, the story begins —
              each player starts their own story sheet.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-marker)] text-xl text-stone-900">
              3. Write, pass, repeat
            </h2>
            <p className="mt-1">
              Every round, everyone answers the same kind of question (who,
              where, what...) on a different player&apos;s story — without seeing
              what was written before. The sheet passes to the next player
              each round, so nobody sees the full story until the end.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-marker)] text-xl text-stone-900">
              4. Read the results
            </h2>
            <p className="mt-1">
              Once every round is done, all the stories are revealed —
              stitched together from everyone&apos;s answers, usually with
              hilarious results.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
