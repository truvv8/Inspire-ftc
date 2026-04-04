"use client";

import { SignInButton } from "@clerk/nextjs";

export default function SignInButtonWrapper({ label }: { label: string }) {
  return (
    <SignInButton>
      <button className="rounded-lg bg-inspire-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600">
        {label}
      </button>
    </SignInButton>
  );
}
