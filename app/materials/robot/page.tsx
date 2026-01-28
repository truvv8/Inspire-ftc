export const dynamic = "force-dynamic";

import MaterialCard from "@/app/components/MaterialCard";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { unstable_noStore as noStore } from "next/cache";

interface Material {
  id: string;
  title: string;
  team_name: string;
  category: string;
  subcategory: string | null;
  file_url: string | null;
  external_url: string | null;
  status: string;
  uploaded_by: string;
  created_at: string;
}

async function getMaterials(category: string): Promise<Material[]> {
  noStore();
  const { data, error } = await supabaseServer
    .from("materials")
    .select("*")
    .eq("category", category)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch materials");
  }

  return data as Material[];
}

export default async function RobotMaterialsPage() {
  const materials = await getMaterials("robot");

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Robot</h1>
        <p className="max-w-2xl text-gray-600">
          Проектирование, механика и электроника FTC-роботов.
        </p>
      </header>

      <div className="flex justify-end mb-6">
        <Link
          href="/materials/upload"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Загрузить материал
        </Link>
      </div>

      {materials.length === 0 && (
        <p className="text-gray-500">Пока нет материалов</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((m) => {
          const href =
            m.external_url && m.external_url.trim() !== ""
              ? m.external_url
              : m.file_url && m.file_url.trim() !== ""
              ? m.file_url
              : null;

          return (
            <MaterialCard
              key={m.id}
              title={m.title}
              description={m.subcategory ?? "Описание отсутствует"}
              tags={m.subcategory ? [m.subcategory] : []}
              author={m.team_name}
              date={new Date(m.created_at).toLocaleDateString("ru-RU")}
              href={href}
            />
          );
        })}
      </div>
    </div>
  );
}
