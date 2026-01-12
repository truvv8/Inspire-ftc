import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold">
          Inspire FTC
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/materials" className="text-gray-600 hover:text-black">
            Материалы
          </Link>

          <Link href="/calendar" className="text-gray-600 hover:text-black">
            FTC Calendar
          </Link>

          <SignedOut>
            <SignInButton>
              <button className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800">
                Войти
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
