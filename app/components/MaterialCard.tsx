import Link from "next/link";

interface Props {
  title: string;
  description: string;
  tags: string[];
  author: string;
  date: string;
  href?: string | null;
}

export default function MaterialCard({
  title,
  description,
  tags,
  author,
  date,
  href,
}: Props) {
  const isDisabled = !href || href === "#";

  if (isDisabled) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 text-slate-600"
        aria-disabled="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50" />
        <div className="relative z-10 space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
            Ссылка скоро появится
          </span>
          <h3 className="text-lg font-semibold text-slate-800">
            {title}
          </h3>
          <p className="text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>
    );
  }

  const isExternal = href.startsWith("http");

  const Component = isExternal ? "a" : Link;
  const props = isExternal
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <Component
      {...props}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.5)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50/70 via-white to-amber-50/70 opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-sky-200/50 blur-3xl opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="space-y-3">
          <span className="block h-1 w-12 rounded-full bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300 transition-all duration-300 group-hover:w-16" />
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {description}
            </p>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
          <span className="max-w-[60%] truncate">{author}</span>
          <span className="inline-flex items-center gap-2">
            {date}
            <span className="text-slate-400 transition group-hover:text-slate-600">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </Component>
  );
}
