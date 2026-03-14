import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { material_id, reason } = body;

  if (!material_id) {
    return NextResponse.json({ error: "material_id is required" }, { status: 400 });
  }

  // Check if user already reported this material
  const { data: existing } = await supabaseServer
    .from("reports")
    .select("id")
    .eq("material_id", material_id)
    .eq("reporter_user_id", userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already reported" }, { status: 409 });
  }

  // Insert report
  const { error: insertError } = await supabaseServer.from("reports").insert({
    material_id,
    reporter_user_id: userId,
    reason: reason || null,
  });

  if (insertError) {
    console.error("Failed to insert report:", insertError);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }

  // Count total reports for this material
  const { count } = await supabaseServer
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("material_id", material_id);

  // Auto-flag if 2+ reports
  if (count && count >= 2) {
    await supabaseServer
      .from("materials")
      .update({ status: "flagged" })
      .eq("id", material_id);
  }

  return NextResponse.json({ success: true });
}