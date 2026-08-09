"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

export default function HowToPlayPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 items-center justify-center bg-[#e8e1d0] px-4 py-16">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#faf7f0] px-10 py-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] sm:px-16">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
        />

        <Link
          href="/"
          aria-label={t.common.back}
          className="absolute left-8 top-12 text-stone-700 hover:text-stone-900"
        >
          ←
        </Link>

        <h1 className="text-center font-[family-name:var(--font-marker)] text-4xl text-stone-900">
          {t.howToPlay.title}
        </h1>
        <p className="mt-2 text-center font-[family-name:var(--font-serif)] italic text-stone-600">
          {t.howToPlay.subtitle}
        </p>

        <div className="mt-10 flex flex-col gap-6 font-[family-name:var(--font-serif)] text-stone-700">
          <section>
            <h2 className="font-[family-name:var(--font-marker)] text-xl text-stone-900">
              {t.howToPlay.section1Title}
            </h2>
            <p className="mt-1">{t.howToPlay.section1Body}</p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-marker)] text-xl text-stone-900">
              {t.howToPlay.section2Title}
            </h2>
            <p className="mt-1">{t.howToPlay.section2Body}</p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-marker)] text-xl text-stone-900">
              {t.howToPlay.section3Title}
            </h2>
            <p className="mt-1">{t.howToPlay.section3Body}</p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-marker)] text-xl text-stone-900">
              {t.howToPlay.section4Title}
            </h2>
            <p className="mt-1">{t.howToPlay.section4Body}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
