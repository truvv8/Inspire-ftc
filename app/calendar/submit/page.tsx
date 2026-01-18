// app/calendar/submit/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SubmitResult = {
  success?: boolean;
  id?: string | number | null;
  error?: string;
};

export default function SubmitEventPage() {
  const router = useRouter();

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
    // if no time provided, interpret as start of day
    if (!dateStr) return null;
    const t = timeStr ? timeStr : "00:00";
    // Construct local ISO (YYYY-MM-DDTHH:MM:00)
    return `${dateStr}T${t}:00`;
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
      payload.date = date || null; // YYYY-MM-DD
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

      // optionally redirect to calendar or show success
      // small delay so user sees success
      setTimeout(() => {
        router.push("/calendar");
      }, 900);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Отправить анонс мероприятия</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Название</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Например: Community Scrimmage"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Описание (опционально)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Team Name (формат Team_Name_FTC)</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Example_Team_FTC"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Время / дата</label>

          <div className="flex gap-4 items-center mb-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={useSingleDate}
                onChange={() => setUseSingleDate(true)}
              />
              Обычная дата (день)
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!useSingleDate}
                onChange={() => setUseSingleDate(false)}
              />
              Диапазон (дата + время)
            </label>
          </div>

          {useSingleDate ? (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded"
              required
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border p-2 rounded w-full mt-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border p-2 rounded w-full mt-2"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Instagram (обязательно)</label>
          <input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="https://instagram.com/your_team"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Verification URL (IG/TG/Website) — обязательно
          </label>
          <input
            value={verificationUrl}
            onChange={(e) => setVerificationUrl(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="ссылка для проверки анонса"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Stream / Meet (опционально)</label>
          <input
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="https://meet.google.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Community / Channel (опционально)</label>
          <input
            value={communityUrl}
            onChange={(e) => setCommunityUrl(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="TG channel / website"
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {result?.success && (
          <p className="text-green-600">
            Успешно отправлено. ID: {String(result.id ?? "—")}. Сейчас перенаправлю на календарь...
          </p>
        )}
        {result?.error && <p className="text-red-600">{result.error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Отправка..." : "Отправить на модерацию"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/calendar")}
            className="border px-4 py-2 rounded"
          >
            Отмена
          </button>
        </div>
      </form>

      <section className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">Подсказка</h3>
        <ul className="text-sm list-disc ml-5 space-y-1">
          <li>Instagram и verification URL обязательны — я проверяю анонс вручную.</li>
          <li>
            Если вы делаете одно-дневное офлайн мероприятие — используйте поле <b>date</b>.
          </li>
          <li>
            Если это встреча/стрим/вебинар с привязкой ко времени — используйте диапазон start/end.
          </li>
          <li>После отправки статус будет <code>pending</code> — ты увидишь событие в админке и сможешь подтвердить.</li>
        </ul>
      </section>
    </div>
  );
}
