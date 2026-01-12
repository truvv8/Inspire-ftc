export default function InspireMaterialsPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">
           Inspire
        </h1>
        <p className="text-gray-600">
          Культура FIRST и развитие команд.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MaterialCard title="Структура FIRST" />
        <MaterialCard title="Как писать портфолио" />
        <MaterialCard title="Ивенты и активности" />
      </div>
    </div>
  );
}

function MaterialCard({ title }: { title: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
      <h3 className="font-semibold">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Скоро здесь появятся материалы.
      </p>
    </div>
  );
}
