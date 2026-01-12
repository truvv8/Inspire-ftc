import Link from "next/link";

interface Props {
  title: string;
  description: string;
  tags: string[];
  author: string;
  date: string;
  href?: string;
}

export default function MaterialCard({
  title,
  description,
  tags,
  author,
  date,
  href = "#",
}: Props) {
  return (
    <Link
      href={href}
      className="group relative rounded-2xl border bg-white p-6 shadow-sm transition
                 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* subtle glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 
                      group-hover:opacity-100 transition
                      bg-gradient-to-br from-blue-50 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {description}
          </p>
        </div>

        {/* tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{author}</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  );
}
