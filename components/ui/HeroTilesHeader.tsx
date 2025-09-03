"use client";

import LetterGlitch from "@/components/ui/LetterGlitch";
import clsx from "clsx";

type Metric = { id: string; label: string; value: string | number };

export default function HeroTilesHeader({
  title,
  subtitle,
  note,
  metrics = [],
  className,
}: {
  title: string;
  subtitle?: string;
  note?: string;
  metrics?: Metric[];
  className?: string;
}) {
  return (
    <section className={clsx("relative overflow-hidden rounded-2xl mb-6", className)}>
      <div className="absolute inset-0">
        <LetterGlitch glitchSpeed={60} centerVignette={false} outerVignette={true} smooth={true} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-indigo-700/50 to-emerald-600/40 mix-blend-overlay" />
      </div>
      <div className="relative z-10 p-6 md:p-8 text-white">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-white/80 max-w-2xl">{subtitle}</p>
        )}
        {note && <p className="mt-1 text-xs text-white/70">{note}</p>}

        {metrics.length > 0 && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div
                key={m.id}
                className="rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/20 px-3 py-2"
              >
                <div className="text-xl font-bold leading-tight">{m.value}</div>
                <div className="text-xs text-white/80 leading-tight">{m.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

