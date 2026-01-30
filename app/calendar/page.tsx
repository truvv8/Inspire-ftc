"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PT_Sans, PT_Serif } from "next/font/google";

type EventType = {
  id: number | string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  city?: string;
  venue?: string;
  description?: string;
  type?: "official" | "community";
};

const bodyFont = PT_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const displayFont = PT_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const calendarTheme = {
  "--calendar-deep": "#0f172a",
  "--calendar-ink": "#0b1220",
  "--calendar-accent": "#f97316",
  "--calendar-cool": "#38bdf8",
  "--calendar-mint": "#22c55e",
} as CSSProperties;

const HERO_EVENT = {
  title: "Kazakhstan Central Asia FIRST Championship 2026",
  date: "10–13 February",
  city: "Astana",
  image: "/events/astana.jpg",
};

const UPCOMING_DATES = [
  { key: "turkistan", label: "12–14 January · Turkistan", jumpTo: "2026-01-12" },
  { key: "aktau", label: "17–18 January · Aktau", jumpTo: "2026-01-17" },
  { key: "astana-qual", label: "23–25 January · Astana", jumpTo: "2026-01-23" },
  { key: "champ", label: "10–13 February · Astana (Championship)", jumpTo: "2026-02-10" },
];

const EVENTS: EventType[] = [
  // January events
  { id: 1, title: "Qualifier – Turkistan", date: "2026-01-12", city: "Turkistan", venue: "Karavan Saray", description: "Regional qualifier for Southern region.", type: "official" },
  { id: 2, title: "Qualifier – Turkistan (Day 2)", date: "2026-01-13", city: "Turkistan", venue: "Karavan Saray", description: "Day 2: matches and awards.", type: "official" },
  { id: 3, title: "Qualifier – Aktau", date: "2026-01-17", city: "Aktau", venue: "Aqtau International School", description: "Western region qualifier.", type: "official" },
  { id: 4, title: "Qualifier – Aktau (Day 2)", date: "2026-01-18", city: "Aktau", venue: "Aqtau International School", description: "Day 2: final rounds.", type: "official" },
  { id: 5, title: "Qualifier – Astana", date: "2026-01-23", city: "Astana",  description: "Northern region qualifier.", type: "official" },
  { id: 6, title: "Qualifier – Astana (Day 2)", date: "2026-01-24", city: "Astana", description: "Day 2: playoffs.", type: "official" },

  // February events (4 days for Championship)
  { id: 7, title: "Central Asia Championship — Day 1", date: "2026-02-10", city: "Astana", description: "Opening and preliminary rounds.", type: "official" },
  { id: 8, title: "Central Asia Championship — Day 2", date: "2026-02-11", city: "Astana", description: "Semi-finals.", type: "official" },
  { id: 9, title: "Central Asia Championship — Finals", date: "2026-02-12", city: "Astana", description: "Final matches and awards.", type: "official" },
  { id: 10, title: "Central Asia Championship — Closing", date: "2026-02-13", city: "Astana", description: "Ceremony & networking.", type: "official" },
];

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Make Monday = 0 offset (so Monday is first column)
  const rawOffset = first.getDay(); // 0..6 (Sun..Sat)
  const offset = rawOffset === 0 ? 6 : rawOffset - 1;

  const days: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

/**
 * Вспомогательная: форматирует Date -> 'YYYY-MM-DD'
 */
function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Если сервер вернул event с start_time/end_time — развернём его
 * по дням, чтобы в календаре появлялись события на каждую дату диапазона.
 * Возвращаем массив EventType (один элемент на каждый день в диапазоне).
 */
function expandServerEventToDays(serverEvent: any): EventType[] {
  // поддерживаем несколько форматов: { date: 'YYYY-MM-DD' } или { start_time, end_time }
  const out: EventType[] = [];
  const title = serverEvent.title ?? serverEvent.name ?? "Event";
  const description = serverEvent.description ?? "";
  const city = serverEvent.city ?? serverEvent.location_city;
  const venue = serverEvent.venue ?? serverEvent.location_venue;
  const baseId = serverEvent.id ?? Math.random().toString(36).slice(2, 9);

  if (serverEvent.date) {
    out.push({
      id: `${baseId}-${serverEvent.date}`,
      title,
      date: serverEvent.date,
      city,
      venue,
      description,
      type: serverEvent.type ?? "community",
    });
    return out;
  }

  if (serverEvent.start_time && serverEvent.end_time) {
    const s = new Date(serverEvent.start_time);
    const e = new Date(serverEvent.end_time);
    // normalize: если start > end, возврат одного дня
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return out;

    // iterate from sDate to eDate inclusive
    const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const last = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    while (cur.getTime() <= last.getTime()) {
      const dayStr = toISODate(cur);
      out.push({
        id: `${baseId}-${dayStr}`,
        title,
        date: dayStr,
        city,
        venue,
        description,
        type: serverEvent.type ?? "community",
      });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  // fallback: if server gives start (date only)
  if (serverEvent.start) {
    const dStr = serverEvent.start.slice(0, 10);
    out.push({
      id: `${baseId}-${dStr}`,
      title,
      date: dStr,
      city,
      venue,
      description,
      type: serverEvent.type ?? "community",
    });
  }

  return out;
}

export default function CalendarPage() {
  // default to Feb 2026 (0-based months)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 1, 1));
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // дополнительные события от сервера (expanded)
  const [serverExpandedEvents, setServerExpandedEvents] = useState<EventType[]>([]);
  const [loadingServerEvents, setLoadingServerEvents] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  const monthName = currentDate.toLocaleString("en-US", { month: "long" });

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  // combined events = локальные official EVENTS + serverExpandedEvents
  const combinedEvents = [...EVENTS, ...serverExpandedEvents];

  // events visible in the currently shown month (используем combinedEvents)
  const eventsForMonth = combinedEvents.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // open modal for event and ensure calendar is on that month
  function openEventAndJump(event: EventType) {
    const d = new Date(event.date);
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedEvent(event);
  }

  // when clicking upcoming chips: find matching event by jumpTo (date) and open it
  function onUpcomingClick(jumpToIso?: string) {
    if (!jumpToIso) return;
    const ev = combinedEvents.find((e) => e.date === jumpToIso);
    if (ev) {
      openEventAndJump(ev);
      return;
    }
    // fallback: just jump to month of jumpToIso
    const d = new Date(jumpToIso);
    if (!isNaN(d.getTime())) {
      setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  // fetch server events for the shown month
  useEffect(() => {
    const abort = new AbortController();
    async function fetchEventsForMonth() {
      setLoadingServerEvents(true);
      setServerExpandedEvents([]); // reset while loading
      try {
        const from = new Date(year, month, 1);
        const to = new Date(year, month + 1, 0);
        const fromStr = toISODate(from);
        const toStr = toISODate(to);

        const res = await fetch(`/api/events?from=${fromStr}&to=${toStr}`, {
          signal: abort.signal,
        });

        if (!res.ok) {
          console.warn("Failed to fetch /api/events:", res.statusText);
          setLoadingServerEvents(false);
          return;
        }

        const data = await res.json();
        // data expected to be array of server events; each can have:
        // - date (YYYY-MM-DD)
        // - or start_time / end_time (ISO timestamp)
        // map each server event to one or many EventType (expand ranges)
        const expanded: EventType[] = [];
        if (Array.isArray(data)) {
          for (const se of data) {
            const items = expandServerEventToDays(se);
            for (const it of items) {
              // avoid duplicates: check if the same id already exists in local EVENTS
              // we keep server ids distinct by prefixing
              expanded.push(it);
            }
          }
        }
        setServerExpandedEvents(expanded);
      } catch (err) {
        if ((err as any).name === "AbortError") {
          // ignore
        } else {
          console.error("Error fetching events:", err);
        }
      } finally {
        setLoadingServerEvents(false);
      }
    }

    fetchEventsForMonth();
    return () => abort.abort();
  }, [year, month]);

  // close modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedEvent(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close modal when clicking outside modal content
  function onBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) setSelectedEvent(null);
  }

  return (
    <div
      className={`${bodyFont.className} relative overflow-hidden bg-slate-50`}
      style={calendarTheme}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 right-[-120px] h-80 w-80 rounded-full bg-[radial-gradient(circle,_var(--calendar-cool),_transparent_70%)] opacity-60 blur-3xl" />
        <div className="absolute top-1/3 -left-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,_var(--calendar-accent),_transparent_72%)] opacity-50 blur-3xl" />
        <div className="absolute bottom-[-140px] right-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,_var(--calendar-mint),_transparent_70%)] opacity-40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-8 p-4 md:p-10">
        {/* HERO */}
        <section
          className="relative overflow-hidden rounded-[32px] border border-white/40 text-white shadow-[0_30px_70px_-40px_rgba(15,23,42,0.9)] motion-safe:animate-fade-up"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.85)), url(${HERO_EVENT.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,_var(--calendar-cool),_transparent_70%)] opacity-60 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,_var(--calendar-accent),_transparent_72%)] opacity-50 blur-3xl" />

          <div className="relative z-10 space-y-4 p-6 md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
              First Age - Season Event
            </span>
            <h1 className={`${displayFont.className} text-3xl md:text-5xl font-semibold leading-tight`}>
              {HERO_EVENT.title}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                Date: {HERO_EVENT.date}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                City: {HERO_EVENT.city}
              </span>
            </div>
          </div>
        </section>

        {/* UPCOMING chips */}
        <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur motion-safe:animate-fade-up-delay-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Upcoming
              </p>
              <h2 className={`${displayFont.className} text-2xl text-slate-900`}>
                Upcoming FTC Events
              </h2>
            </div>
            <div className="text-sm text-slate-500">
              Click chip -&gt; jump to month
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {UPCOMING_DATES.map((c) => (
              <button
                key={c.key}
                onClick={() => onUpcomingClick(c.jumpTo)}
                className="rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                aria-label={`Jump to ${c.label}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* Calendar header + month switch */}
        <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur motion-safe:animate-fade-up-delay-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={prevMonth}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                aria-label="Previous month"
              >
                Prev
              </button>

              <div className={`${displayFont.className} text-xl font-semibold text-slate-900 md:text-2xl`}>
                {monthName} {year}
              </div>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-50"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                aria-label="Next month"
              >
                Next
              </button>
            </div>

            <div className="text-sm text-slate-500">
              Events this month:{" "}
              <span className="font-semibold text-slate-900">
                {eventsForMonth.length}
              </span>
              {loadingServerEvents && (
                <span className="ml-2 text-xs text-slate-400">loading...</span>
              )}
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="bg-slate-900/90 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/80"
              >
                {d}
              </div>
            ))}

            {/* Days */}
            {days.map((date, idx) => {
              const dayEvents = date
                ? combinedEvents.filter(
                    (e) =>
                      new Date(e.date).toDateString() === date.toDateString()
                  )
                : [];

              const isToday =
                date && new Date().toDateString() === date.toDateString();
              const isWeekend = date
                ? date.getDay() === 0 || date.getDay() === 6
                : false;

              const baseTone = date
                ? isWeekend
                  ? "bg-slate-50/80"
                  : "bg-white/80"
                : "bg-slate-50/60";

              return (
                <div
                  key={idx}
                  className={`group relative min-h-[120px] border border-slate-200/70 p-2 transition ${baseTone} ${
                    isToday
                      ? "ring-2 ring-orange-400/70 ring-inset shadow-[0_0_0_1px_rgba(249,115,22,0.25)]"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {date && (
                    <span
                      className={`absolute left-2 top-2 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${
                        isToday
                          ? "bg-orange-500 text-white"
                          : isWeekend
                          ? "bg-slate-100 text-slate-500"
                          : "text-slate-500"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  )}

                  <div className="mt-8 space-y-1">
                    {(() => {
                      const MAX_VISIBLE = 2;
                      const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
                      const hiddenCount = dayEvents.length - visibleEvents.length;

                      return (
                        <>
                          {visibleEvents.map((event) => (
                            <div
                              key={String(event.id)}
                              onClick={() => openEventAndJump(event)}
                              className={`flex items-start gap-2 rounded-lg border px-2 py-1 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 ${
                                event.type === "official"
                                  ? "border-orange-200/80 bg-orange-50/90 text-orange-900 hover:bg-orange-100"
                                  : "border-emerald-200/80 bg-emerald-50/90 text-emerald-900 hover:bg-emerald-100"
                              }`}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") openEventAndJump(event);
                              }}
                              title={event.title}
                            >
                              <span
                                className={`mt-1 h-2 w-2 rounded-full ${
                                  event.type === "official"
                                    ? "bg-orange-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                              <span className="block truncate">{event.title}</span>
                            </div>
                          ))}

                          {hiddenCount > 0 && (
                            <button
                              onClick={() => openEventAndJump(dayEvents[0])}
                              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                            >
                              +{hiddenCount} more
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm"
            onMouseDown={onBackdropClick}
          >
            <div
              ref={modalRef}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500" />
              <div className="p-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute right-4 top-4 rounded-full bg-slate-100 px-2 py-1 text-sm text-slate-500 transition hover:text-slate-900"
                  aria-label="Close"
                >
                  X
                </button>

                <h3 className={`${displayFont.className} text-2xl text-slate-900`}>
                  {selectedEvent.title}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Date: {new Date(selectedEvent.date).toLocaleDateString()}
                  </span>
                  {selectedEvent.city && (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      City: {selectedEvent.city}
                    </span>
                  )}
                  {selectedEvent.venue && (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Venue: {selectedEvent.venue}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-slate-700">
                  {selectedEvent.description ??
                    "Details will appear soon. Schedule, map, teams, and contacts will be added here."}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const start = selectedEvent.date;
                      const title = encodeURIComponent(selectedEvent.title);
                      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start.replace(/-/g, "")}/${start.replace(/-/g, "")}`;
                      window.open(url, "_blank");
                    }}
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
                  >
                    Add to Google Calendar
                  </button>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit community event */}
        <div className="flex justify-center pt-4 motion-safe:animate-fade-up-delay-3">
          <a
            href="/calendar/submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            + Submit Community Event
          </a>
        </div>
      </div>
    </div>
  );
}
