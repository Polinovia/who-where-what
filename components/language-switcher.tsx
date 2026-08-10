"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Language } from "@/lib/i18n/translations";

const LANGUAGES: Language[] = ["en", "fr"];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();

  // Language is picked before the game (home, lobby, waiting room) — once
  // play has started, switching would translate the question/answer you're
  // mid-way through typing, so the switcher is hidden during that screen.
  if (pathname.endsWith("/play")) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex overflow-hidden rounded-full border border-stone-300 bg-[#faf7f0] text-xs shadow-md">
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          className={`px-3 py-1.5 uppercase transition-colors ${
            language === lang
              ? "bg-stone-800 text-stone-50"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
