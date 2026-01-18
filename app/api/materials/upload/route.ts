import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase-server";

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

  if (!/^[A-Za-z0-9_]+_FTC$/.test(teamName)) {
    return NextResponse.json(
      { error: "Team name must be in format Team_Name_FTC" },
      { status: 400 }
    );
  }

  let fileUrl: string | null = null;
  let externalUrl: string | null = null;

  // 📁 FILE
  if (uploadType === "file") {
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const filePath = `${teamName}/${category}/${subcategory}/${Date.now()}-${file.name}`;
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

  // 🔗 LINK
  if (uploadType === "link") {
    externalUrl = formData.get("external_url") as string;
    if (!externalUrl) {
      return NextResponse.json({ error: "External URL is required" }, { status: 400 });
    }
  }

  const { error: dbError } = await supabaseServer.from("materials").insert({
    title,
    team_name: teamName,
    category,
    subcategory,
    file_url: fileUrl,
    external_url: externalUrl,
    status: "pending",
    uploaded_by: userId,
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
