"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AuthCard } from "@/components/auth-card";
import { registerSchema } from "@/lib/validation/auth";
import { useLanguage } from "@/lib/i18n/language-context";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t.signup.invalidForm);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data?.error?.formErrors?.[0] ?? data?.error ?? t.common.unexpectedError);
      return;
    }

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard title={t.signup.title} subtitle={t.signup.subtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder={t.signup.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500"
        />
        <input
          type="email"
          required
          placeholder={t.signup.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500"
        />
        <input
          type="password"
          required
          placeholder={t.signup.passwordPlaceholder}
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
          {loading ? t.signup.creating : t.signup.createAccount}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        {t.signup.alreadyAccount}{" "}
        <Link href="/login" className="font-medium text-stone-900 hover:underline">
          {t.signup.logIn}
        </Link>
      </p>
    </AuthCard>
  );
}
