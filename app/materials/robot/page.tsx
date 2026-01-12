import MaterialCard from "@/app/components/MaterialCard";

export default function RobotMaterialsPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">
          Robot
        </h1>
        <p className="max-w-2xl text-gray-600">
          Проектирование, механика и электроника FTC‑роботов.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MaterialCard
          title="Основы CAD для FTC"
          description="Как проектировать детали и сборки для FTC‑робота."
          tags={["CAD", "Design", "Robot"]}
          author="Team Inspire"
          date="Янв 2026"
        />

        <MaterialCard
          title="Механизмы: лифты и захваты"
          description="Обзор популярных механизмов и ошибок при проектировании."
          tags={["Mechanics", "Robot"]}
          author="FTC Mentor Hub"
          date="Янв 2026"
        />

        <MaterialCard
          title="Электрика FTC"
          description="Подключение, безопасность и best‑practice."
          tags={["Electronics", "Control Hub"]}
          author="Inspire FTC"
          date="Дек 2025"
        />
      </div>
    </div>
  );
}
