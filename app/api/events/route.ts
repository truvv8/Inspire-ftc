// app/api/events/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD
 * - возвращает approved события
 * - если переданы from/to — фильтрует события по диапазону (работает с date OR start_time/end_time)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fromStr = url.searchParams.get("from");
    const toStr = url.searchParams.get("to");

    // берём все approved — проще и надежнее, потом фильтруем в js
    const { data: rows, error } = await supabaseServer
      .from("calendar_events")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // если from/to не заданы — возвращаем всё
    if (!fromStr || !toStr) {
      return NextResponse.json(rows ?? []);
    }

    const fromDate = new Date(fromStr + "T00:00:00Z");
    const toDate = new Date(toStr + "T23:59:59Z");

    const filtered = (rows ?? []).filter((ev: any) => {
      // 1) если есть поле date (день) — сравниваем
      if (ev.date) {
        const d = new Date(ev.date + "T00:00:00Z");
        return d.getTime() >= fromDate.getTime() && d.getTime() <= toDate.getTime();
      }

      // 2) если есть start_time/end_time — проверяем пересечение диапазонов
      if (ev.start_time && ev.end_time) {
        const s = new Date(ev.start_time);
        const e = new Date(ev.end_time);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return false;
        // overlap check: start <= to && end >= from
        return s.getTime() <= toDate.getTime() && e.getTime() >= fromDate.getTime();
      }

      // 3) fallback: если есть start (ISO) — сравнить по дате
      if (ev.start) {
        const d = new Date(ev.start);
        return d.getTime() >= fromDate.getTime() && d.getTime() <= toDate.getTime();
      }

      return false;
    });

    return NextResponse.json(filtered);
  } catch (e: any) {
    console.error("GET /api/events error:", e);
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/events
 * body: { title, description, team_name, date?, start_time?, end_time?, instagram_url, verification_url, stream_url?, community_url? }
 * Использует supabaseServer — у тебя должен быть SUPABASE_SERVICE_ROLE_KEY в env.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      team_name,
      date,
      start_time,
      end_time,
      instagram_url,
      verification_url,
      stream_url,
      community_url,
    } = body;

    if (!title || !team_name || !instagram_url || !verification_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log("SERVICE ROLE KEY EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const insertPayload: any = {
      title,
      description: description ?? null,
      team_name,
      date: date ?? null,
      start_time: start_time ?? null,
      end_time: end_time ?? null,
      instagram_url,
      verification_url,
      stream_url: stream_url ?? null,
      community_url: community_url ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer
      .from("calendar_events")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id ?? null });
  } catch (e: any) {
    console.error("POST /api/events error:", e);
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
