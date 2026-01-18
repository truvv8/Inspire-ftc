export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      team_name,
      start_time,
      end_time,
      instagram_url,
      verification_url,
      stream_url,
      community_url,
    } = body;

    // базовая валидация
    if (!title || !team_name || !instagram_url || !verification_url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // payload, который уйдёт в SQL-функцию
    const insertPayload = {
      title,
      description: description ?? null,
      team_name,
      start_time: start_time ?? null,
      end_time: end_time ?? null,
      instagram_url,
      verification_url,
      stream_url: stream_url ?? null,
      community_url: community_url ?? null,
    };

    // 🔥 ВАЖНО: ТОЛЬКО RPC
    const { data, error } = await supabaseServer.rpc(
      "insert_calendar_event",
      {
        event: insertPayload,
      }
    );

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
    });
  } catch (e: any) {
    console.error("POST /api/events/submit error:", e);
    return NextResponse.json(
      { error: e.message ?? "Server error" },
      { status: 500 }
    );
  }
}
