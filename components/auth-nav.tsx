"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/language-context";

export function HomeHeader() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  if (status === "loading") {
    return <header className="flex items-center justify-between">
      <div className="h-6 w-48" />
      <div className="h-6 w-32" />
    </header>;
  }

  if (session?.user) {
    return (
      <header className="flex items-center justify-between">
        <p className="font-[family-name:var(--font-script)] text-2xl text-stone-500">
          {t.home.welcomeBack}{" "}
          <Link href="/profile" className="underline hover:text-stone-900">
            {session.user.name}
          </Link>
        </p>
        <nav className="flex items-center gap-6 text-stone-600">
          <Link href="/friends" className="hover:text-stone-900">
            {t.home.friends}
          </Link>
          <button onClick={() => signOut()} className="hover:text-stone-900">
            {t.home.logOut}
          </button>
        </nav>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between">
      <p className="font-[family-name:var(--font-script)] text-2xl text-stone-500">
        {t.home.dontLoseStories}
      </p>
      <nav className="flex items-center gap-6 text-stone-600">
        <Link href="/login" className="hover:text-stone-900">
          {t.home.logIn}
        </Link>
        <Link href="/signup" className="hover:text-stone-900">
          {t.home.signIn}
        </Link>
      </nav>
    </header>
  );
}
