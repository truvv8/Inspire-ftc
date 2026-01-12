import MaterialCard from "@/app/components/MaterialCard";

export default function CodeMaterialsPage() {
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MaterialCard
          title="Чистая архитектура FTC‑кода"
          description="Как структурировать проект и не утонуть в хаосе."
          tags={["Java", "Architecture"]}
          author="Senior FTC Dev"
          date="Янв 2026"
        />

        <MaterialCard
          title="Автономка: базовый пайплайн"
          description="State machine, тайминги и тестирование."
          tags={["Autonomous", "Control"]}
          author="Team Atlas"
          date="Дек 2025"
        />
      </div>
    </div>
  );
}
