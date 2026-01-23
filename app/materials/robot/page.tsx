export const dynamic = "force-dynamic";


import MaterialCard from "@/app/components/MaterialCard";
import Link from "next/link";
import { headers } from "next/headers";

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
  const headersList = headers();
  const host = headersList.get("host");

  const res = await fetch(`http://${host}/api/materials/${category}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to fetch materials");
  }

  return res.json();
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
