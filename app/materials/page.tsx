import Link from "next/link";
import { PT_Sans, PT_Serif } from "next/font/google";

const bodyFont = PT_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const displayFont = PT_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const categories = [
  {
    title: "Robot",
    description: "CAD, механика, электроника и сборка FTC-роботов.",
    href: "/materials/robot",
    image: "/materials/robot.png",
  },
  {
    title: "Code",
    description: "Телеоп, автономка, вижн, архитектура и тестирование.",
    href: "/materials/code",
    image: "/materials/code.png",
  },
  {
    title: "Inspire",
    description: "Ценности FIRST, outreach, портфолио и командный рост.",
    href: "/materials/inspire",
    image: "/materials/inspire.png",
  },
];

export default function MaterialsPage() {
  return (
    <div className={`${bodyFont.className} space-y-14`}>
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Inspire FTC
        </p>
        <h1 className={`${displayFont.className} text-4xl text-slate-900`}>
          Материалы для команд FTC
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Обучающие материалы по робототехнике, программированию и Inspire-
          культуре FIRST Tech Challenge.
        </p>
      </header>

      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.title} {...category} />
        ))}
      </section>

      <UploadCard />
    </div>
  );
}

function CategoryCard({
  title,
  description,
  href,
  image,
}: {
  title: string;
  description: string;
  href: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-100 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      <div
        className="absolute inset-0 bg-slate-200 transition duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent" />

      <div className="relative z-10 space-y-2 p-6 text-white">
        <h3 className={`${displayFont.className} text-2xl`}>{title}</h3>
        <p className="text-sm text-white/85">{description}</p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/90">
          Перейти
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

function UploadCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Upload
        </p>
        <h2 className={`${displayFont.className} mt-3 text-3xl text-slate-900`}>
          Можно загрузить материал
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Нажмите кнопку
        </p>
      <Link
          href="/materials/upload"
          className="mt-5 inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.8)] transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-700"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-base">
            ↑
          </span>
          Upload material
        </Link>
      </div>
    </section>
  );
}
