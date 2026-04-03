import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Navbar() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="inline-block h-2 w-2 rounded-full bg-inspire-green" />
          {t("brand")}
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link
            href="/materials"
            className="text-white/50 transition hover:text-white"
          >
            {t("materials")}
          </Link>

          <Link href="/resources" className="text-white/50 transition hover:text-white">
            {t("resources")}
          </Link>

          <Link
            href="/calendar"
            className="text-white/50 transition hover:text-white"
          >
            {t("calendar")}
          </Link>

          <Link
            href="/leaderboard"
            className="text-white/50 transition hover:text-white"
          >
            {t("leaderboard")}
          </Link>

          <LanguageSwitcher />

          <SignedOut>
            <SignInButton>
              <button className="rounded-lg bg-inspire-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600">
                {t("signIn")}
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}