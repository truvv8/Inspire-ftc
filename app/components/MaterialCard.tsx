import Link from "next/link";
import ReportButton from "./ReportButton";

interface Props {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  date: string;
  href?: string | null;
  linkComingSoon?: string;
}

export default function MaterialCard({
  id,
  title,
  description,
  tags,
  author,
  date,
  href,
  linkComingSoon = "Link coming soon",
}: Props) {
  const isDisabled = !href || href === "#";

  if (isDisabled) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-white/40"
        aria-disabled="true"
      >
        <div className="relative z-10 space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
            {linkComingSoon}
          </span>
          <h3 className="font-serif text-lg font-semibold text-white/50">
            {title}
          </h3>
          <p className="text-sm text-white/30">{description}</p>
        </div>
      </div>
    );
  }

  const isExternal = href.startsWith("http");

  const Component = isExternal ? "a" : Link;
  const linkProps = isExternal
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : { href };

  return (
    <Component
      {...linkProps}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.06]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-inspire-sky/5 via-transparent to-inspire-orange/5 opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="space-y-3">
          <div className="h-1 w-10 rounded-full bg-gradient-to-r from-inspire-orange to-amber-400 transition-all duration-300 group-hover:w-14" />
          <div>
            <h3 className="font-serif text-lg font-semibold tracking-tight text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm text-white/40">{description}</p>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-xs text-white/30">
          <span className="max-w-[50%] truncate font-medium text-white/50">{author}</span>
          <span className="inline-flex items-center gap-2">
            {id && <ReportButton materialId={id} />}
            {date}
            <span className="text-white/20 transition group-hover:text-inspire-orange">
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