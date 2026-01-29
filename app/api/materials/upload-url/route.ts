import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 60;

function toSafeSegment(input: string, fallback: string) {
  const safe = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]+/g, "");
  return safe || fallback;
}

function toSafeFilename(filename: string) {
  const lastDot = filename.lastIndexOf(".");
  const hasExt = lastDot > 0 && lastDot < filename.length - 1;
  const base = hasExt ? filename.slice(0, lastDot) : filename;
  const ext = hasExt ? filename.slice(lastDot).toLowerCase() : "";

  const safeBase = toSafeSegment(base, "file");
  const safeExt = ext.replace(/[^a-z0-9.]+/g, "");

  return `${safeBase}${safeExt}`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    team_name?: string;
    category?: string;
    subcategory?: string;
    filename?: string;
  } = {};

  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const teamName = payload.team_name?.trim() ?? "";
  const category = payload.category?.trim() ?? "";
  const subcategory = payload.subcategory?.trim() ?? "";
  const filename = payload.filename?.trim() ?? "";

  if (!teamName || !category || !subcategory || !filename) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!/^[A-Za-z0-9_]+_FTC$/.test(teamName)) {
    return NextResponse.json(
      { error: "Team name must be in format Team_Name_FTC" },
      { status: 400 }
    );
  }

  const safeSubcategory = toSafeSegment(subcategory, "misc");
  const safeFilename = toSafeFilename(filename);
  const filePath = `${teamName}/${category}/${safeSubcategory}/${Date.now()}-${safeFilename}`;

  const { data: signedData, error: signedError } = await supabaseServer.storage
    .from("materials")
    .createSignedUploadUrl(filePath);

  if (signedError || !signedData) {
    return NextResponse.json(
      { error: signedError?.message || "Failed to create signed upload URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    path: filePath,
    token: signedData.token,
  });
}
