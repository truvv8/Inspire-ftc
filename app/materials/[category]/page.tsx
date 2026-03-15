import Link from "next/link";
import ReportButton from "@/app/components/ReportButton";
import { getTranslations } from "next-intl/server";

interface Material {
  id: string;
  title: string;
  team_name: string;
  category: string;
  subcategory: string;
  file_url: string | null;
  external_url: string | null;
  status: string;
  uploaded_by: string;
  created_at: string;
}

async function getMaterials(category: string): Promise<Material[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/materials/${category}`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const materials = await getMaterials(params.category);
  const t = await getTranslations("category");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold capitalize text-white">
          {params.category}
        </h1>

        <Link
          href="/materials/upload"
          className="rounded-xl bg-inspire-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          {t("uploadMaterial")}
        </Link>
      </div>

      {materials.length === 0 && (
        <p className="text-white/40">{t("noMaterials")}</p>
      )}

      <div className="grid gap-4">
        {materials.map((m) => {
          const href =
            m.external_url && m.external_url.trim() !== ""
              ? m.external_url
              : m.file_url && m.file_url.trim() !== ""
              ? m.file_url
              : null;

          return (
            <div key={m.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-lg text-white">{m.title}</h2>
                  <p className="text-sm text-white/40">{m.subcategory}</p>
                </div>
                <ReportButton materialId={m.id} />
              </div>
              <p className="text-sm mt-1 text-white/50">{t("status")}: {m.status}</p>

              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-inspire-green hover:text-emerald-400 underline text-sm transition"
                >
                  {t("openMaterial")}
                </a>
              ) : (
                <span className="text-white/30 text-sm">
                  {t("noLink")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}