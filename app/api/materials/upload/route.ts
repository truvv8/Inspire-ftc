import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase-server";
import { determineAutoModeration } from "@/lib/moderation";
import { checkRateLimit } from "@/lib/rate-limit";

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

  const formData = await req.formData();

  const title = formData.get("title") as string;
  const teamName = formData.get("team_name") as string;
  const category = formData.get("category") as string;
  const subcategory = formData.get("subcategory") as string;
  const uploadType = formData.get("upload_type") as "file" | "link";

  if (!title || !teamName || !category || !subcategory || !uploadType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (uploadType !== "file" && uploadType !== "link") {
    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  }

  // Rate limit: max 5 uploads per hour
  const rateCheck = await checkRateLimit(userId);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again later. (${rateCheck.remaining} remaining)` },
      { status: 429 }
    );
  }

  if (!/^[A-Za-z0-9_]+_FTC$/.test(teamName)) {
    return NextResponse.json(
      { error: "Team name must be in format Team_Name_FTC" },
      { status: 400 }
    );
  }

  let fileUrl: string | null = null;
  let externalUrl: string | null = null;

  // FILE
  if (uploadType === "file") {
    const existingPath = (formData.get("file_path") as string | null)?.trim();
    if (existingPath) {
      const expectedPrefix = `${teamName}/${category}/`;
      if (!existingPath.startsWith(expectedPrefix)) {
        return NextResponse.json(
          { error: "File path does not match team/category" },
          { status: 400 }
        );
      }

      const { data: info, error: infoError } = await supabaseServer.storage
        .from("materials")
        .info(existingPath);

      if (infoError || !info) {
        return NextResponse.json(
          { error: "Uploaded file not found" },
          { status: 400 }
        );
      }

      const { data } = supabaseServer.storage
        .from("materials")
        .getPublicUrl(existingPath);

      fileUrl = data.publicUrl;
    } else {
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
      }

      const safeSubcategory = toSafeSegment(subcategory, "misc");
      const safeFilename = toSafeFilename(file.name);
      const filePath = `${teamName}/${category}/${safeSubcategory}/${Date.now()}-${safeFilename}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabaseServer.storage
        .from("materials")
        .upload(filePath, buffer, { contentType: file.type });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data } = supabaseServer.storage
        .from("materials")
        .getPublicUrl(filePath);

      fileUrl = data.publicUrl;
    }
  }

  // LINK
  if (uploadType === "link") {
    externalUrl = formData.get("external_url") as string;
    if (!externalUrl) {
      return NextResponse.json({ error: "External URL is required" }, { status: 400 });
    }
  }

  // Determine auto-moderation status
  const file = uploadType === "file" ? (formData.get("file") as File | null) : null;
  const moderation = determineAutoModeration(
    uploadType,
    externalUrl,
    file?.name ?? (formData.get("file_path") as string | null),
    file?.type,
  );

  const { error: dbError } = await supabaseServer.from("materials").insert({
    title,
    team_name: teamName,
    category,
    subcategory,
    file_url: fileUrl,
    external_url: externalUrl,
    status: moderation.status,
    uploaded_by: userId,
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
