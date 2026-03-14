// app/calendar/submit/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type SubmitResult = {
  success?: boolean;
  id?: string | number | null;
  error?: string;
};

export default function SubmitEventPage() {
  const router = useRouter();
  const t = useTranslations("submitEvent");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamName, setTeamName] = useState("");
  const [useSingleDate, setUseSingleDate] = useState(true);

  // single date
  const [date, setDate] = useState("");

  // start / end (date + time) inputs
  const [startDate, setStartDate] = useState(""); // yyyy-mm-dd
  const [startTime, setStartTime] = useState(""); // HH:MM
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [instagramUrl, setInstagramUrl] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [communityUrl, setCommunityUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  function makeIso(dateStr: string, timeStr: string) {
    if (!dateStr) return null;
    const tm = timeStr ? timeStr : "00:00";
    return `${dateStr}T${tm}:00`;
  }

  function validateForm() {
    if (!title.trim()) return "Title is required";
    if (!teamName.trim()) return "Team name is required";
    if (!instagramUrl.trim()) return "Instagram URL is required";
    if (!verificationUrl.trim())
      return "Verification URL (IG/TG/website) is required";

    if (useSingleDate) {
      if (!date) return "Please choose a date";
    } else {
      if (!startDate || !startTime) return "Please choose start date and time";
      if (!endDate || !endTime) return "Please choose end date and time";
      const s = new Date(makeIso(startDate, startTime) as string).getTime();
      const e = new Date(makeIso(endDate, endTime) as string).getTime();
      if (isNaN(s) || isNaN(e)) return "Invalid start or end time";
      if (s > e) return "Start must be before end";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);

    const payload: any = {
      title: title.trim(),
      description: description.trim() || null,
      team_name: teamName.trim(),
      instagram_url: instagramUrl.trim(),
      verification_url: verificationUrl.trim(),
      stream_url: streamUrl.trim() || null,
      community_url: communityUrl.trim() || null,
    };

    if (useSingleDate) {
      payload.date = date || null;
      payload.start_time = null;
      payload.end_time = null;
    } else {
      payload.date = null;
      payload.start_time = makeIso(startDate, startTime);
      payload.end_time = makeIso(endDate, endTime);
    }

    try {
      const res = await fetch("/api/events/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ error: data?.error ?? "Server error" });
        setError(data?.error ?? "Server error");
        setLoading(false);
        return;
      }

      setResult({ success: true, id: data?.id ?? null });
      setLoading(false);

      setTimeout(() => {
        router.push("/calendar");
      }, 900);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition focus:border-inspire-orange/50 focus:ring-1 focus:ring-inspire-orange/30";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif font-bold mb-6 text-white">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t("nameLabel")}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder={t("namePlaceholder")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t("descriptionLabel")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t("teamNameLabel")}</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className={inputClass}
            placeholder={t("teamNamePlaceholder")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">{t("dateTimeLabel")}</label>

          <div className="flex gap-4 items-center mb-3 text-white/70">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useSingleDate}
                onChange={() => setUseSingleDate(true)}
                className="accent-inspire-orange"
              />
              {t("singleDate")}
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useSingleDate}
                onChange={() => setUseSingleDate(false)}
                className="accent-inspire-orange"
              />
              {t("dateRange")}
            </label>
          </div>

          {useSingleDate ? (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs text-white/40">{t("startDate")}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-white/40">{t("endDate")}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t("instagramLabel")}</label>
          <input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className={inputClass}
            placeholder="https://instagram.com/your_team"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">
            {t("verificationLabel")}
          </label>
          <input
            value={verificationUrl}
            onChange={(e) => setVerificationUrl(e.target.value)}
            className={inputClass}
            placeholder={t("verificationPlaceholder")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t("streamLabel")}</label>
          <input
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            className={inputClass}
            placeholder="https://meet.google.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t("communityLabel")}</label>
          <input
            value={communityUrl}
            onChange={(e) => setCommunityUrl(e.target.value)}
            className={inputClass}
            placeholder="TG channel / website"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {result?.success && (
          <p className="text-emerald-400 text-sm">{t("success")}</p>
        )}
        {result?.error && <p className="text-red-400 text-sm">{result.error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-inspire-orange px-6 py-2.5 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? t("submitLoading") : t("submit")}
          </button>

          <button
            type="button"
            onClick={() => router.push("/calendar")}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 font-semibold text-white/70 transition hover:bg-white/10"
          >
            {t("cancel")}
          </button>
        </div>
      </form>

      <section className="mt-8 glass-card rounded-xl p-5">
        <h3 className="font-medium mb-2 text-white/70">{t("hintTitle")}</h3>
        <ul className="text-sm list-disc ml-5 space-y-1 text-white/40">
          <li>{t("hint1")}</li>
          <li>{t("hint2")}</li>
          <li>{t("hint3")}</li>
          <li>{t("hint4")}</li>
        </ul>
      </section>
    </div>
  );
}