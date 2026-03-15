"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${365 * 24 * 60 * 60}`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-white/15 bg-white/10 p-0.5 text-xs font-medium">
      <button
        onClick={() => switchLocale("ru")}
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "ru"
            ? "bg-inspire-green text-white"
            : "text-slate-400 hover:text-white"
        }`}
      >
        RU
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "en"
            ? "bg-inspire-green text-white"
            : "text-slate-400 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}