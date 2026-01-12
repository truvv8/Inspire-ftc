import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-32">
      {/* HERO */}
      <section className="relative overflow-hidden pt-24">
        {/* background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-white to-white" />

        <div className="flex flex-col items-center text-center gap-8">
          <span className="rounded-full border bg-white/70 px-4 py-1 text-sm text-gray-600 backdrop-blur">
            Платформа для FIRST Tech Challenge
          </span>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            Inspire FTC -
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              пространство роста команд
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-gray-600">
            Материалы по робототехнике и коду, FTC‑календарь,
            Inspire‑культура и сообщество команд в одном месте.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/materials"
              className="rounded-xl bg-black px-6 py-3 text-white font-medium hover:scale-105 hover:bg-gray-800 transition"
            >
              Смотреть материалы
            </Link>

            <Link
              href="/calendar"
              className="rounded-xl border px-6 py-3 font-medium hover:bg-gray-100 transition"
            >
              FTC Calendar
            </Link>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="grid gap-6 sm:grid-cols-3 text-center">
        <Highlight value="50+" label="Команд" />
        <Highlight value="200+" label="Материалов" />
        <Highlight value="30+" label="Ивентов" />
      </section>

      {/* VALUES */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <ValueCard
          title="Робот и код"
          description="CAD, механика, электроника, телеоп, автономка и инженерные best‑practice."
        />

        <ValueCard
          title="Inspire"
          description="Ценности FIRST, портфолио, структура команды и развитие культуры."
        />

        <ValueCard
          title="Сообщество"
          description="FTC‑календарь, ивенты команд и взаимодействие внутри платформы."
        />
      </section>
    </div>
  );
}

function Highlight({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="mt-1 text-gray-600">
        {label}
      </div>
    </div>
  );
}

function ValueCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <h3 className="mb-2 text-xl font-semibold">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
