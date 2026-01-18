import Link from "next/link";

export default function MaterialsPage() {
  return (
    <div className="space-y-16">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold">
          Материалы для команд FTC
        </h1>
        <p className="max-w-2xl text-gray-600">
          Обучающие материалы по робототехнике, программированию
          и Inspire-культуре FIRST Tech Challenge.
        </p>
      </header>

      {/* Main categories */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <CategoryCard
          title="Robot"
          description="CAD, механика, электрика и сборка FTC-роботов."
          href="/materials/robot"
        />

        <CategoryCard
          title="Code"
          description="Телеоп, автономка, башня, одометрия и тюнинг."
          href="/materials/code"
        />

        <CategoryCard
          title="Inspire"
          description="Ценности FIRST, портфолио, структура и ивенты."
          href="/materials/inspire"
        />
      </section>

      {/* Upload centered */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <CategoryCard
            title="⬆Upload"
            description="Загрузить материал от команды или ментора."
            href="/materials/upload"
          />
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <h3 className="mb-2 text-2xl font-semibold">
        {title}
      </h3>

      <p className="text-gray-600">
        {description}
      </p>

      <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:underline">
        Перейти →
      </span>
    </Link>
  );
}
