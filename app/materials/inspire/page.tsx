export const dynamic = "force-dynamic";

import MaterialCard from "@/app/components/MaterialCard";
import { supabaseServer } from "@/lib/supabase-server";

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

async function getMaterials() {
  const { data, error } = await supabaseServer
    .from("materials")
    .select("*")
    .eq("category", "inspire")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Material[];
}

export default async function InspireMaterialsPage() {
  const materials = await getMaterials();

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Inspire</h1>
        <p className="text-gray-600">
          Культура FIRST и развитие команд.
        </p>
      </header>

      {materials.length === 0 && (
        <p className="text-gray-500">
          Пока нет материалов в этой категории.
        </p>
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
