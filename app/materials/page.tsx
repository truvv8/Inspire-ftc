import Image from "next/image";
import Link from "next/link";
import { PT_Sans, PT_Serif } from "next/font/google";
import { getTranslations } from "next-intl/server";

const bodyFont = PT_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const displayFont = PT_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

export default async function MaterialsPage() {
  const t = await getTranslations("materials");

  const categories = [
    {
      title: t("robotTitle"),
      description: t("robotDescription"),
      href: "/materials/robot",
      image: "/materials/robot.png",
    },
    {
      title: t("codeTitle"),
      description: t("codeDescription"),
      href: "/materials/code",
      image: "/materials/code.png",
    },
    {
      title: t("inspireTitle"),
      description: t("inspireDescription"),
      href: "/materials/inspire",
      image: "/materials/inspire.png",
    },
  ];

  return (
    <div className={`${bodyFont.className} space-y-14`}>
      <header className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
            <Image
              src="/brand/nomadic-dragons-logo.png"
              alt="Nomadic Dragons"
              width={80}
              height={80}
              priority
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              {t("badge")}
            </p>
            <h1 className={`${displayFont.className} text-4xl text-white`}>
              {t("title")}
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-base text-white/50">
          {t("description")}
        </p>
      </header>

      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.title} {...category} goToLabel={t("goTo")} />
        ))}
      </section>

      <UploadCard
        badge={t("uploadBadge")}
        title={t("uploadTitle")}
        hint={t("uploadHint")}
        buttonLabel={t("uploadButton")}
      />
    </div>
  );
}

function CategoryCard({
  title,
  description,
  href,
  image,
  goToLabel,
}: {
  title: string;
  description: string;
  href: string;
  image: string;
  goToLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-sm transition hover:-translate-y-1 hover:border-white/20 hover:shadow-lg"
    >
      <div
        className="absolute inset-0 bg-white/5 transition duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative z-10 space-y-2 p-6 text-white">
        <h3 className={`${displayFont.className} text-2xl`}>{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/80">
          {goToLabel}
          <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  );
}

function UploadCard({
  badge,
  title,
  hint,
  buttonLabel,
}: {
  badge: string;
  title: string;
  hint: string;
  buttonLabel: string;
}) {
  return (
    <section className="glass-card rounded-3xl p-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">
          {badge}
        </p>
        <h2 className={`${displayFont.className} mt-3 text-3xl text-white`}>
          {title}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          {hint}
        </p>
        <Link
          href="/materials/upload"
          className="mt-5 inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-inspire-orange to-orange-600 px-6 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(249,115,22,0.6)] transition hover:-translate-y-0.5 hover:from-orange-500 hover:to-orange-700"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-base">
            &uarr;
          </span>
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}