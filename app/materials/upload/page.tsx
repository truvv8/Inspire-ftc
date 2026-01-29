"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export default function UploadMaterialPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const router = useRouter();

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

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Загрузка материала</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Название" required className="w-full border p-2" />

        <input
          name="team_name"
          placeholder="Team_Name_FTC"
          required
          className="w-full border p-2"
        />

        <select name="category" required className="w-full border p-2">
          <option value="">Категория</option>
          <option value="robot">Robot</option>
          <option value="code">Code</option>
          <option value="inspire">Inspire</option>
        </select>

        <input
          name="subcategory"
          placeholder="Подкатегория (например CAD)"
          required
          className="w-full border p-2"
        />

        {/* TYPE SWITCH */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={uploadType === "file"}
              onChange={() => setUploadType("file")}
            />
            Файл
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={uploadType === "link"}
              onChange={() => setUploadType("link")}
            />
            Ссылка (YouTube / Drive)
          </label>
        </div>

        {/* FILE */}
        {uploadType === "file" && (
          <input type="file" name="file" required className="w-full" />
        )}

        {/* LINK */}
        {uploadType === "link" && (
          <input
            type="url"
            name="external_url"
            placeholder="https://youtube.com/... или https://drive.google.com/..."
            required
            className="w-full border p-2"
          />
        )}

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Загрузка..." : "Загрузить"}
        </button>
      </form>
    </div>
  );
}
