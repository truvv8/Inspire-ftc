"use client";
import { useEffect, useRef, useState } from "react";

type EventType = {
  id: number | string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  city?: string;
  venue?: string;
  description?: string;
  type?: "official" | "community";
};

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
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      {/* HERO */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-xl"
        style={{
          backgroundImage: `url(${HERO_EVENT.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "220px",
        }}
      >
        <div className="bg-black/55 p-6 md:p-8 text-white space-y-3 h-full">
          <span className="inline-block bg-black/80 px-3 py-1 rounded-full text-sm font-semibold">
            FIRST AGE · SEASON EVENT
          </span>

          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
            {HERO_EVENT.title}
          </h1>

          <p className="text-sm text-gray-200">
            📅 {HERO_EVENT.date} · 📍 {HERO_EVENT.city}
          </p>
        </div>
      </div>

      {/* UPCOMING chips */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming FTC Events</h2>
          <div className="text-sm text-gray-500">
            Click chip → jump to month
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {UPCOMING_DATES.map((c) => (
            <button
              key={c.key}
              onClick={() => onUpcomingClick(c.jumpTo)}
              className="rounded-full bg-orange-500 text-white px-5 py-2 text-sm font-medium shadow hover:scale-105 transition transform"
              aria-label={`Jump to ${c.label}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Calendar header + month switch */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="px-3 py-2 rounded-lg border hover:bg-gray-100"
              aria-label="Previous month"
            >
              ←
            </button>

            <div className="text-lg font-semibold">
              {monthName} {year}
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 rounded-lg border hover:bg-gray-100 text-sm"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="px-3 py-2 rounded-lg border hover:bg-gray-100"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className="text-sm text-gray-500">
            Events this month: <span className="font-medium">{eventsForMonth.length}</span>
            {loadingServerEvents && <span className="ml-2 text-xs text-gray-400">loading...</span>}
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 rounded-2xl overflow-hidden border">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="bg-gray-100 py-2 text-center text-sm font-medium border-b"
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
              date &&
              new Date().toDateString() === date.toDateString();

            return (
              <div
                key={idx}
                className={`min-h-[120px] border p-2 relative bg-white ${date ? "" : "bg-gray-50/60"}`}
              >
                {date && (
                  <span
                    className={`absolute top-2 right-2 text-xs px-1 ${isToday ? "bg-blue-600 text-white rounded" : "text-gray-400"}`}
                  >
                    {date.getDate()}
                  </span>
                )}

                <div className="mt-6 space-y-1">
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
                          className={`rounded px-2 py-1 text-xs font-medium cursor-pointer ${
                            event.type === "official"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") openEventAndJump(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}

                      {hiddenCount > 0 && (
                        <div
                          onClick={() => openEventAndJump(dayEvents[0])}
                          className="text-xs text-gray-500 cursor-pointer hover:underline"
                        >
                          +{hiddenCount} more
                        </div>
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onMouseDown={onBackdropClick}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-lg"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              aria-label="Close"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold">{selectedEvent.title}</h3>

            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <div>📅 {new Date(selectedEvent.date).toLocaleDateString()}</div>
              {selectedEvent.city && <div>· 📍 {selectedEvent.city}</div>}
              {selectedEvent.venue && <div>· {selectedEvent.venue}</div>}
            </div>

            <p className="text-sm text-gray-700 mt-4">
              {selectedEvent.description ??
                "Подробности ещё уточняются. Здесь будет расписание, карта, команды и контакты организаторов."}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  const start = selectedEvent.date;
                  const title = encodeURIComponent(selectedEvent.title);
                  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start.replace(/-/g, "")}/${start.replace(/-/g, "")}`;
                  window.open(url, "_blank");
                }}
                className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm"
              >
                Add to Google Calendar
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for future community features */}
      {/* Submit community event */}
      <div className="flex justify-center pt-6">
        <a
          href="/calendar/submit"
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700 hover:scale-105"
        >
          ➕ Submit Community Event
        </a>
      </div>

    </div>
  );
}
