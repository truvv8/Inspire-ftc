import Link from "next/link";

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold capitalize">
          {params.category}
        </h1>

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

      <div className="grid gap-4">
        {materials.map((m) => {
          const href =
            m.external_url && m.external_url.trim() !== ""
              ? m.external_url
              : m.file_url && m.file_url.trim() !== ""
              ? m.file_url
              : null;

          return (
            <div key={m.id} className="border rounded-xl p-4">
              <h2 className="font-semibold text-lg">{m.title}</h2>
              <p className="text-sm text-gray-500">{m.subcategory}</p>
              <p className="text-sm">Статус: {m.status}</p>

              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Открыть материал
                </a>
              ) : (
                <span className="text-gray-400 text-sm">
                  Нет доступной ссылки
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
