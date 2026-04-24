import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const { data, error } = await supabase
  .from("materials")
  .select("*")
  .eq("category", category)
  .eq("status", "approved") // ✅ ВОТ ЭТО КЛЮЧ
  .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
