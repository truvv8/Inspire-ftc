"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadMaterialPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("upload_type", uploadType);

    const res = await fetch("/api/materials/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upload failed");
      setLoading(false);
      return;
    }

    router.push("/materials");
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

        {/* 🔘 TYPE SWITCH */}
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

        {/* 📁 FILE */}
        {uploadType === "file" && (
          <input type="file" name="file" required className="w-full" />
        )}

        {/* 🔗 LINK */}
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
