"use client";
import { useEffect, useRef, useState } from "react";
import { PT_Sans, PT_Serif } from "next/font/google";
import { useTranslations } from "next-intl";

type EventType = {
  id: number | string;
  title: string;
  date: string;
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

const EVENTS: EventType[] = [
  { id: 1, title: "Qualifier – Turkistan", date: "2026-01-12", city: "Turkistan", venue: "Karavan Saray", description: "Regional qualifier for Southern region.", type: "official" },
  { id: 2, title: "Qualifier – Turkistan (Day 2)", date: "2026-01-13", city: "Turkistan", venue: "Karavan Saray", description: "Day 2: matches and awards.", type: "official" },
  { id: 3, title: "Qualifier – Aktau", date: "2026-01-17", city: "Aktau", venue: "Aqtau International School", description: "Western region qualifier.", type: "official" },
  { id: 4, title: "Qualifier – Aktau (Day 2)", date: "2026-01-18", city: "Aktau", venue: "Aqtau International School", description: "Day 2: final rounds.", type: "official" },
  { id: 5, title: "Qualifier – Astana", date: "2026-01-23", city: "Astana", description: "Northern region qualifier.", type: "official" },
  { id: 6, title: "Qualifier – Astana (Day 2)", date: "2026-01-24", city: "Astana", description: "Day 2: playoffs.", type: "official" },
  { id: 7, title: "Central Asia Championship — Day 1", date: "2026-02-10", city: "Astana", description: "Opening and preliminary rounds.", type: "official" },
  { id: 8, title: "Central Asia Championship — Day 2", date: "2026-02-11", city: "Astana", description: "Semi-finals.", type: "official" },
  { id: 9, title: "Central Asia Championship — Finals", date: "2026-02-12", city: "Astana", description: "Final matches and awards.", type: "official" },
  { id: 10, title: "Central Asia Championship — Closing", date: "2026-02-13", city: "Astana", description: "Ceremony & networking.", type: "official" },
];

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const rawOffset = first.getDay();
  const offset = rawOffset === 0 ? 6 : rawOffset - 1;

  const days: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function expandServerEventToDays(serverEvent: any): EventType[] {
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
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return out;

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
  const t = useTranslations("calendar");
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [dayPanelEvents, setDayPanelEvents] = useState<{ date: Date; events: EventType[] } | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [serverExpandedEvents, setServerExpandedEvents] = useState<EventType[]>([]);
  const [loadingServerEvents, setLoadingServerEvents] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  const monthName = currentDate.toLocaleString("en-US", { month: "long" });

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const combinedEvents = [...EVENTS, ...serverExpandedEvents];

  const eventsForMonth = combinedEvents.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  function openEventAndJump(event: EventType) {
    const d = new Date(event.date);
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedEvent(event);
  }

  useEffect(() => {
    const abort = new AbortController();
    async function fetchEventsForMonth() {
      setLoadingServerEvents(true);
      setServerExpandedEvents([]);
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
        const expanded: EventType[] = [];
        if (Array.isArray(data)) {
          for (const se of data) {
            const items = expandServerEventToDays(se);
            for (const it of items) {
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (selectedEvent) setSelectedEvent(null);
        else if (dayPanelEvents) setDayPanelEvents(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedEvent, dayPanelEvents]);

  function onBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) setSelectedEvent(null);
  }

  return (
    <div className={`${bodyFont.className} relative`}>
      {/* Aurora glow behind calendar */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-inspire-orange/[0.06] blur-[150px] animate-aurora" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-inspire-sky/[0.05] blur-[130px] animate-aurora" style={{ animationDelay: "-7s" }} />
        <div className="absolute bottom-1/4 left-1/3 h-[350px] w-[350px] rounded-full bg-emerald-500/[0.04] blur-[120px] animate-aurora" style={{ animationDelay: "-13s" }} />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        {/* Calendar header */}
        <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={prevMonth}
              className="group rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              aria-label="Previous month"
            >
              <span className="inline-block transition group-hover:-translate-x-0.5">&larr;</span>
            </button>

            <h1 className={`${displayFont.className} text-2xl font-semibold md:text-3xl bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent animate-gradient bg-[length:200%_100%]`}>
              {monthName} {year}
            </h1>

            <button
              onClick={nextMonth}
              className="group rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              aria-label="Next month"
            >
              <span className="inline-block transition group-hover:translate-x-0.5">&rarr;</span>
            </button>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:bg-white/10 hover:text-white/80"
            >
              {t("today")}
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/40">
            <span>
              {t("eventsThisMonth")}:{" "}
              <span className="font-semibold text-white">{eventsForMonth.length}</span>
            </span>
            {loadingServerEvents && (
              <span className="text-xs text-white/30">{t("loading")}</span>
            )}
            <a
              href="/calendar/submit"
              className="rounded-full bg-inspire-orange px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/30"
            >
              {t("submitEvent")}
            </a>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] animate-fade-up-delay-1" style={{ background: "rgba(255,255,255,0.02)" }}>
          {/* Top gradient accent line */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-inspire-orange/60 to-transparent" />

          <div className="grid grid-cols-7">
            {(t.raw("weekdays") as string[]).map((d: string) => (
              <div
                key={d}
                className="bg-white/[0.03] py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40 border-b border-white/5"
              >
                {d}
              </div>
            ))}

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
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={idx}
                  className={`group relative min-h-[110px] border border-white/[0.04] p-2 transition-all duration-300 ${
                    !date
                      ? "bg-white/[0.01]"
                      : isToday
                      ? "animate-today-ring bg-orange-500/[0.06]"
                      : isWeekend
                      ? "bg-white/[0.015]"
                      : "bg-transparent"
                  } ${date && !isToday ? "hover:bg-white/[0.05]" : ""}`}
                >
                  {/* Shimmer on hover for days with events */}
                  {hasEvents && !isToday && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer rounded-sm" />
                  )}

                  {date && (
                    <span
                      className={`relative z-10 absolute left-2 top-2 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-xs font-bold transition-all ${
                        isToday
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                          : hasEvents
                          ? "text-white/70 group-hover:text-white group-hover:bg-white/10"
                          : isWeekend
                          ? "text-white/25"
                          : "text-white/40"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  )}

                  <div className="relative z-10 mt-9 space-y-1">
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
                              className={`flex items-start gap-2 rounded-lg border px-2 py-1 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer hover:shadow-lg ${
                                event.type === "official"
                                  ? "border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 hover:shadow-orange-500/10 hover:border-orange-500/50"
                                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:shadow-emerald-500/10 hover:border-emerald-500/50"
                              }`}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") openEventAndJump(event);
                              }}
                              title={event.title}
                            >
                              <span
                                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                                  event.type === "official"
                                    ? "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]"
                                    : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                                }`}
                              />
                              <span className="block truncate">{event.title}</span>
                            </div>
                          ))}

                          {hiddenCount > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDayPanelEvents({ date: date!, events: dayEvents });
                              }}
                              className="inline-flex items-center gap-2 text-xs font-medium text-white/40 transition hover:text-white/70"
                            >
                              +{hiddenCount} {t("more")}
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

          {/* Bottom gradient accent line */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-inspire-sky/40 to-transparent" />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-white/40 animate-fade-up-delay-2">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
            Official
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Community
          </span>
        </div>
      </div>

      {/* Day Events Panel */}
      {dayPanelEvents && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDayPanelEvents(null);
          }}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-[0_0_60px_rgba(249,115,22,0.08)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="h-[2px] bg-gradient-to-r from-sky-500 via-emerald-500 to-orange-500" />
            <div className="p-6">
              <button
                onClick={() => setDayPanelEvents(null)}
                className="absolute right-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-sm text-white/50 transition hover:text-white hover:bg-white/15"
                aria-label="Close"
              >
                X
              </button>

              <h3 className={`${displayFont.className} text-xl text-white`}>
                {dayPanelEvents.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <p className="mt-1 text-sm text-white/40">
                {dayPanelEvents.events.length} event{dayPanelEvents.events.length !== 1 ? "s" : ""}
              </p>

              <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto">
                {dayPanelEvents.events.map((event) => (
                  <button
                    key={String(event.id)}
                    onClick={() => {
                      setDayPanelEvents(null);
                      openEventAndJump(event);
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                      event.type === "official"
                        ? "border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 hover:shadow-orange-500/10"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:shadow-emerald-500/10"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        event.type === "official"
                          ? "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]"
                          : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                      }`}
                    />
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold">{event.title}</span>
                      {event.city && (
                        <span className="block text-xs opacity-70">{event.city}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
          onMouseDown={onBackdropClick}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-[0_0_60px_rgba(249,115,22,0.08)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="h-[2px] bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500" />
            <div className="p-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute right-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-sm text-white/50 transition hover:text-white hover:bg-white/15"
                aria-label="Close"
              >
                X
              </button>

              <h3 className={`${displayFont.className} text-2xl text-white`}>
                {selectedEvent.title}
              </h3>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                  {t("date")}: {new Date(selectedEvent.date).toLocaleDateString()}
                </span>
                {selectedEvent.city && (
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                    {t("city")}: {selectedEvent.city}
                  </span>
                )}
                {selectedEvent.venue && (
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                    {t("venue")}: {selectedEvent.venue}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-white/50">
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
                  className="rounded-full bg-inspire-orange px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-orange-500/30"
                >
                  {t("addToGoogle")}
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}