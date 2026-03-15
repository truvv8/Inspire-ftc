"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export default function UploadMaterialPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const router = useRouter();
  const t = useTranslations("upload");

  async function readJsonSafe(res: Response) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        return await res.json();
      } catch {
        return {};
      }
    }

    const text = await res.text();
    return text ? { error: text } : {};
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") ?? "");
    const teamName = String(formData.get("team_name") ?? "");
    const category = String(formData.get("category") ?? "");
    const subcategory = String(formData.get("subcategory") ?? "");

    try {
      if (uploadType === "file") {
        const file = formData.get("file");
        if (!(file instanceof File)) {
          setError("File is required");
          return;
        }

        if (file.size === 0) {
          setError("File is empty");
          return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          setError("File is too large (max 50MB)");
          return;
        }

        const initRes = await fetch("/api/materials/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team_name: teamName,
            category,
            subcategory,
            filename: file.name,
          }),
        });

        const initData = await readJsonSafe(initRes);
        if (!initRes.ok) {
          setError(initData.error || "Failed to start upload");
          return;
        }

        const { path, token } = initData as { path: string; token: string };
        const { error: uploadError } = await supabase.storage
          .from("materials")
          .uploadToSignedUrl(path, token, file, {
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          setError(uploadError.message || "Upload failed");
          return;
        }

        const finalize = new FormData();
        finalize.append("title", title);
        finalize.append("team_name", teamName);
        finalize.append("category", category);
        finalize.append("subcategory", subcategory);
        finalize.append("upload_type", "file");
        finalize.append("file_path", path);

        const finalizeRes = await fetch("/api/materials/upload", {
          method: "POST",
          body: finalize,
        });

        const finalizeData = await readJsonSafe(finalizeRes);
        if (!finalizeRes.ok) {
          setError(finalizeData.error || "Upload failed");
          return;
        }

        router.push("/materials");
        return;
      }

      formData.append("upload_type", "link");
      const res = await fetch("/api/materials/upload", {
        method: "POST",
        body: formData,
      });

      const data = await readJsonSafe(res);
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      router.push("/materials");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition focus:border-inspire-green/50 focus:ring-1 focus:ring-inspire-green/30";

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-serif font-bold mb-6 text-white">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder={t("nameLabel")} required className={inputClass} />

        <input
          name="team_name"
          placeholder={t("teamNamePlaceholder")}
          required
          className={inputClass}
        />

        <select name="category" required className={inputClass}>
          <option value="" className="bg-black">{t("categoryLabel")}</option>
          <option value="robot" className="bg-black">Robot</option>
          <option value="code" className="bg-black">Code</option>
          <option value="inspire" className="bg-black">Inspire</option>
        </select>

        <input
          name="subcategory"
          placeholder={t("subcategoryLabel")}
          required
          className={inputClass}
        />

        {/* TYPE SWITCH */}
        <div className="flex gap-4 text-white/70">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={uploadType === "file"}
              onChange={() => setUploadType("file")}
              className="accent-inspire-green"
            />
            {t("typeFile")}
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={uploadType === "link"}
              onChange={() => setUploadType("link")}
              className="accent-inspire-green"
            />
            {t("typeLink")}
          </label>
        </div>

        {/* FILE */}
        {uploadType === "file" && (
          <input type="file" name="file" required className="w-full text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white file:cursor-pointer hover:file:bg-white/15" />
        )}

        {/* LINK */}
        {uploadType === "link" && (
          <input
            type="url"
            name="external_url"
            placeholder="https://youtube.com/... or https://drive.google.com/..."
            required
            className={inputClass}
          />
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-inspire-green px-6 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? t("submitLoading") : t("submit")}
        </button>
      </form>
    </div>
  );
}