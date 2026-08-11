"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { JoinLobbyButton } from "@/components/join-lobby-button";
import { PlaySoloButton } from "@/components/play-solo-button";
import { HomeHeader } from "@/components/auth-nav";
import { useLanguage } from "@/lib/i18n/language-context";
import { dismissInvite, listMyInvites } from "@/lib/api-client";

export default function Home() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: invitesData } = useQuery({
    queryKey: ["invites"],
    queryFn: listMyInvites,
    enabled: !!session?.user,
    refetchInterval: 5000,
  });

  const dismissMutation = useMutation({
    mutationFn: dismissInvite,
    onSuccess: (_result, id) => {
      queryClient.setQueryData(
        ["invites"],
        (current: { invites: { id: string }[] } | undefined) =>
          current ? { invites: current.invites.filter((i) => i.id !== id) } : current,
      );
    },
  });

  return (
    <div className="flex flex-1 items-center justify-center bg-[#e8e1d0] px-4 py-16">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#faf7f0] px-10 py-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] sm:px-16 sm:py-16">
        {/* pin */}
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
        />

        <HomeHeader />

        {invitesData && invitesData.invites.length > 0 && (
          <div className="mt-8 flex flex-col gap-2">
            {invitesData.invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3"
              >
                <p className="font-[family-name:var(--font-serif)] text-stone-800">
                  {t.invites.invitedBy(invite.fromUser.name)}
                  {invite.lobby.name ? ` — ${invite.lobby.name}` : ""}
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/lobby/${invite.lobby.code}/join`}
                    className="rounded-lg bg-[#33261c] px-3 py-1.5 text-sm text-stone-50 hover:bg-[#241a13]"
                  >
                    {t.invites.join}
                  </Link>
                  <button
                    type="button"
                    aria-label={t.invites.dismiss}
                    onClick={() => dismissMutation.mutate(invite.id)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <main className="mt-20 flex flex-col items-center text-center">
          <h1 className="font-[family-name:var(--font-marker)] text-5xl leading-tight text-stone-900 sm:text-6xl">
            {t.home.title}
          </h1>
          <p className="mt-4 font-[family-name:var(--font-serif)] italic text-lg text-stone-600">
            {t.home.tagline}
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-4">
            <Link
              href="/lobby/create"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#33261c] text-lg text-stone-50 shadow-md transition-colors hover:bg-[#241a13]"
            >
              <span aria-hidden>✎</span>
              {t.home.createLobby}
            </Link>

            <JoinLobbyButton />

            <PlaySoloButton />
          </div>

          <div className="mt-12 flex flex-col items-center gap-1">
            <Link
              href="/how-to-play"
              className="font-[family-name:var(--font-serif)] text-2xl text-stone-800 hover:underline"
            >
              {t.home.howToPlay}
            </Link>
            <p className="font-[family-name:var(--font-serif)] italic text-base text-stone-500">
              {t.home.players}
            </p>
          </div>
        </main>

        <footer className="mt-16 text-center">
          <a
            href="https://portfolio-polina.netlify.app/#projects/who-where-what"
            target="_blank"
            rel="noopener noreferrer"
            className="font-[family-name:var(--font-script)] text-xl text-stone-500 hover:text-stone-700"
          >
            {t.home.feedback}
          </a>
        </footer>
      </div>
    </div>
  );
}
