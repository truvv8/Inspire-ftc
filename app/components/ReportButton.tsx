"use client";

import { useState } from "react";

interface Props {
  materialId: string;
}

export default function ReportButton({ materialId }: Props) {
  const [state, setState] = useState<"idle" | "confirm" | "loading" | "done" | "error">("idle");

  async function handleReport() {
    setState("loading");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: materialId }),
      });

      if (res.status === 409) {
        setState("done"); // already reported
        return;
      }

      if (!res.ok) {
        setState("error");
        return;
      }

      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-white/40">
        <FlagIcon className="h-3.5 w-3.5" />
        Reported
      </span>
    );
  }

  if (state === "confirm" || state === "loading") {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <button
          onClick={handleReport}
          disabled={state === "loading"}
          className="rounded-full bg-red-500/20 px-2.5 py-1 font-medium text-red-400 transition hover:bg-red-500/30"
        >
          {state === "loading" ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setState("idle")}
          disabled={state === "loading"}
          className="rounded-full bg-white/10 px-2.5 py-1 font-medium text-white/50 transition hover:bg-white/15"
        >
          Cancel
        </button>
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="text-xs text-red-400">Error</span>
    );
  }

  return (
    <button
      onClick={() => setState("confirm")}
      className="inline-flex items-center gap-1 rounded-full p-1 text-white/30 transition hover:bg-red-500/15 hover:text-red-400"
      title="Report this material"
      aria-label="Report this material"
    >
      <FlagIcon className="h-3.5 w-3.5" />
    </button>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}