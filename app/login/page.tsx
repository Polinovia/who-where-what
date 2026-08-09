"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AuthCard } from "@/components/auth-card";
import { useLanguage } from "@/lib/i18n/language-context";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t.login.incorrectCredentials);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard title={t.login.title} subtitle={t.login.subtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder={t.login.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500"
        />
        <input
          type="password"
          required
          placeholder={t.login.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 rounded-xl bg-[#33261c] text-stone-50 transition-colors hover:bg-[#241a13] disabled:opacity-50"
        >
          {loading ? t.login.connecting : t.login.logIn}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        {t.login.noAccount}{" "}
        <Link href="/signup" className="font-medium text-stone-900 hover:underline">
          {t.login.signIn}
        </Link>
      </p>
    </AuthCard>
  );
}
