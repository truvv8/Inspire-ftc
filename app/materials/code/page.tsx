export const dynamic = "force-dynamic";

import MaterialCard from "@/app/components/MaterialCard";
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
  created_at: string;
}

async function getMaterials(): Promise<Material[]> {
  noStore();
  const { data, error } = await supabaseServer
    .from("materials")
    .select("*")
    .eq("category", "code")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch Code materials");
  }

  return data as Material[];
}

export default async function CodeMaterialsPage() {
  const materials = await getMaterials();

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">
          Code
        </h1>
        <p className="max-w-2xl text-gray-600">
          Программирование FTC‑роботов: телеоп, автономка и архитектура.
        </p>
      </header>

      {materials.length === 0 && (
        <p className="text-gray-500">РџРѕРєР° РЅРµС‚ РјР°С‚РµСЂРёР°Р»РѕРІ РІ СЌС‚РѕР№ РєР°С‚РµРіРѕСЂРёРё.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((m) => {
          const href =
            m.external_url && m.external_url.trim() !== ""
              ? m.external_url
              : m.file_url && m.file_url.trim() !== ""
              ? m.file_url
              : "#";

          return (
            <MaterialCard
              key={m.id}
              title={m.title}
              description={m.subcategory ?? "РћРїРёСЃР°РЅРёРµ РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚"}
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
