"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function HomeHeader() {
  const { data: session, status } = useSession();

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
          Welcome back, {session.user.name}
        </p>
        <nav className="flex items-center gap-6 text-stone-600">
          <Link href="/friends" className="hover:text-stone-900">
            Friends
          </Link>
          <button onClick={() => signOut()} className="hover:text-stone-900">
            Log out
          </button>
        </nav>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between">
      <p className="font-[family-name:var(--font-script)] text-2xl text-stone-500">
        Don&apos;t lose your stories
      </p>
      <nav className="flex items-center gap-6 text-stone-600">
        <Link href="/login" className="hover:text-stone-900">
          Log in
        </Link>
        <Link href="/signup" className="hover:text-stone-900">
          Sign in
        </Link>
      </nav>
    </header>
  );
}
