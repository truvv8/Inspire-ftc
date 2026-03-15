import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="space-y-24">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 px-6 py-20 text-white md:px-12 md:py-28">
        {/* Radial glows — green theme */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.08] blur-[120px] animate-pulse-glow" />
          <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-inspire-sky/5 blur-[100px]" />
          <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-teal-400/5 blur-[100px]" />
        </div>

        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left — text */}
          <div className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left">
            <span className="animate-fade-up rounded-full border border-white/10 bg-white/5 px-5 py-1.5 text-sm font-medium text-white/60 backdrop-blur-sm">
              {t("badge")}
            </span>

            <h1 className="animate-fade-up max-w-4xl font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              {t("title")}
              <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text pb-2 text-transparent animate-gradient">
                {t("titleAccent")}
              </span>
            </h1>

            <p className="animate-fade-up-delay-1 max-w-2xl text-base text-white/50 md:text-lg">
              {t("description")}
            </p>

            <div className="animate-fade-up-delay-2 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/materials"
                className="rounded-xl bg-inspire-green px-7 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/30"
              >
                {t("ctaMaterials")}
              </Link>

              <Link
                href="/calendar"
                className="rounded-xl border border-inspire-green/30 bg-white/5 px-7 py-3 font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-inspire-green/50 hover:bg-white/10"
              >
                {t("ctaCalendar")}
              </Link>

              <a
                href="#contribute"
                className="rounded-xl bg-inspire-green-deep px-7 py-3 font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                {t("ctaContribute")}
              </a>
            </div>
          </div>

          {/* Right — SVG robot wireframe */}
          <div className="hidden lg:flex items-center justify-center">
            <svg
              viewBox="0 0 280 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-[360px] w-auto drop-shadow-[0_0_30px_rgba(52,211,153,0.15)]"
              aria-hidden="true"
            >
              <style>{`
                .robot-line {
                  stroke: #34D399;
                  stroke-width: 1.5;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                  fill: none;
                  stroke-dasharray: 800;
                  stroke-dashoffset: 800;
                  animation: draw-robot 3s ease forwards;
                }
                .robot-line-delay {
                  animation-delay: 0.5s;
                }
                .robot-line-delay-2 {
                  animation-delay: 1s;
                }
                .robot-line-delay-3 {
                  animation-delay: 1.5s;
                }
                .robot-fill {
                  fill: rgba(52, 211, 153, 0.06);
                  stroke: #34D399;
                  stroke-width: 1.5;
                  stroke-dasharray: 600;
                  stroke-dashoffset: 600;
                  animation: draw-robot 2.5s ease forwards;
                }
                .robot-eye {
                  fill: #34D399;
                  opacity: 0;
                  animation: eye-on 0.3s ease 2s forwards;
                }
                .robot-gear {
                  stroke: #34D399;
                  stroke-width: 1;
                  fill: none;
                  opacity: 0;
                  animation: eye-on 0.5s ease 2.5s forwards;
                  transform-origin: center;
                }
                .gear-spin {
                  animation: eye-on 0.5s ease 2.5s forwards, gear-rotate 8s linear 2.5s infinite;
                }
                @keyframes draw-robot {
                  to { stroke-dashoffset: 0; }
                }
                @keyframes eye-on {
                  to { opacity: 1; }
                }
                @keyframes gear-rotate {
                  to { transform: rotate(360deg); }
                }
              `}</style>

              {/* Antenna */}
              <line x1="140" y1="30" x2="140" y2="70" className="robot-line" />
              <circle cx="140" cy="24" r="6" className="robot-line" />

              {/* Head */}
              <rect x="90" y="70" width="100" height="70" rx="12" className="robot-fill" />
              {/* Eyes */}
              <circle cx="120" cy="105" r="8" className="robot-line robot-line-delay" />
              <circle cx="160" cy="105" r="8" className="robot-line robot-line-delay" />
              <circle cx="120" cy="105" r="3" className="robot-eye" />
              <circle cx="160" cy="105" r="3" className="robot-eye" />

              {/* Neck */}
              <line x1="130" y1="140" x2="130" y2="160" className="robot-line robot-line-delay" />
              <line x1="150" y1="140" x2="150" y2="160" className="robot-line robot-line-delay" />

              {/* Body */}
              <rect x="70" y="160" width="140" height="120" rx="10" className="robot-fill robot-line-delay" />

              {/* Chest detail */}
              <rect x="110" y="180" width="60" height="40" rx="6" className="robot-line robot-line-delay-2" />
              <line x1="140" y1="185" x2="140" y2="215" className="robot-line robot-line-delay-2" />
              <line x1="115" y1="200" x2="165" y2="200" className="robot-line robot-line-delay-2" />

              {/* Left arm */}
              <line x1="70" y1="180" x2="30" y2="210" className="robot-line robot-line-delay-2" />
              <line x1="30" y1="210" x2="20" y2="260" className="robot-line robot-line-delay-2" />
              <rect x="10" y="258" width="24" height="16" rx="4" className="robot-line robot-line-delay-3" />

              {/* Right arm */}
              <line x1="210" y1="180" x2="250" y2="210" className="robot-line robot-line-delay-2" />
              <line x1="250" y1="210" x2="260" y2="260" className="robot-line robot-line-delay-2" />
              <rect x="248" y="258" width="24" height="16" rx="4" className="robot-line robot-line-delay-3" />

              {/* Left leg */}
              <line x1="110" y1="280" x2="100" y2="340" className="robot-line robot-line-delay-3" />
              <rect x="82" y="338" width="36" height="14" rx="4" className="robot-line robot-line-delay-3" />

              {/* Right leg */}
              <line x1="170" y1="280" x2="180" y2="340" className="robot-line robot-line-delay-3" />
              <rect x="162" y="338" width="36" height="14" rx="4" className="robot-line robot-line-delay-3" />

              {/* Gear — top-right, spinning */}
              <g className="gear-spin" style={{ transformOrigin: "240px 60px" }}>
                <circle cx="240" cy="60" r="16" className="robot-gear" />
                <circle cx="240" cy="60" r="6" className="robot-gear" />
                {[0, 45, 90, 135].map((angle) => (
                  <line
                    key={angle}
                    x1={240 + 12 * Math.cos((angle * Math.PI) / 180)}
                    y1={60 + 12 * Math.sin((angle * Math.PI) / 180)}
                    x2={240 + 20 * Math.cos((angle * Math.PI) / 180)}
                    y2={60 + 20 * Math.sin((angle * Math.PI) / 180)}
                    className="robot-gear"
                  />
                ))}
              </g>

              {/* Gear — bottom-left, spinning */}
              <g className="gear-spin" style={{ transformOrigin: "40px 320px" }}>
                <circle cx="40" cy="320" r="12" className="robot-gear" />
                <circle cx="40" cy="320" r="4" className="robot-gear" />
                {[0, 60, 120].map((angle) => (
                  <line
                    key={angle}
                    x1={40 + 9 * Math.cos((angle * Math.PI) / 180)}
                    y1={320 + 9 * Math.sin((angle * Math.PI) / 180)}
                    x2={40 + 15 * Math.cos((angle * Math.PI) / 180)}
                    y2={320 + 15 * Math.sin((angle * Math.PI) / 180)}
                    className="robot-gear"
                  />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* CONTRIBUTE */}
      <section id="contribute" className="space-y-10 scroll-mt-24">
        <div className="text-center space-y-3">
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
            {t("contributeTitle")}
          </h2>
          <p className="mx-auto max-w-xl text-white/50">
            {t("contributeSubtitle")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <ContributeCard
            href="/materials/upload"
            title={t("cardShareMaterials")}
            description={t("cardShareMaterialsDesc")}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <ContributeCard
            href="/calendar/submit"
            title={t("cardSubmitEvent")}
            description={t("cardSubmitEventDesc")}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="16" r="2" />
              </svg>
            }
          />
          <ContributeCard
            href="#"
            title={t("cardReport")}
            description={t("cardReportDesc")}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="4" y1="22" x2="4" y2="15" strokeLinecap="round" />
              </svg>
            }
          />
          <ContributeCard
            href="/sign-up"
            title={t("cardJoinCommunity")}
            description={t("cardJoinCommunityDesc")}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" strokeLinecap="round" />
                <path d="M19 8v6m3-3h-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </section>

    </div>
  );
}


function ContributeCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group glass-card glass-card-hover flex items-start gap-4 rounded-2xl p-6 transition hover:-translate-y-1"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-inspire-green/10 text-inspire-green-light transition group-hover:bg-inspire-green/20">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-white">
          {title}
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white/30 transition group-hover:translate-x-1 group-hover:text-inspire-green-light">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </h3>
        <p className="mt-1 text-sm text-white/40">{description}</p>
      </div>
    </Link>
  );
}