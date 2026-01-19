import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _: Request,
  { params }: { params: { category: string } }
) {
  const { data, error } = await supabase
  .from("materials")
  .select("*")
  .eq("category", params.category)
  .eq("status", "approved") // ✅ ВОТ ЭТО КЛЮЧ
  .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
