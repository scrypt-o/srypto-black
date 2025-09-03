"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import clsx from "clsx";

export type DemoTile = {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon?: keyof typeof Icons | string;
  badge?: string | number;
  status?: string | { text: string; tone?: "neutral" | "success" | "warning" | "info" | "danger" };
  accent?: "indigo" | "emerald" | "rose" | "amber" | "blue" | "purple" | "teal" | "fuchsia" | "cyan" | "pink" | "yellow";
  disabled?: boolean;
};

export type DemoTileGridProps = {
  title?: string;
  subtitle?: string;
  tiles: DemoTile[];
  columns?: { base?: number; sm?: number; md?: number; lg?: number };
  onTileClick?: (href: string, tile: DemoTile) => void;
  className?: string;
};

const accentHex: Record<NonNullable<DemoTile["accent"]>, string> = {
  indigo: "#6366f1",
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  teal: "#14b8a6",
  fuchsia: "#d946ef",
  cyan: "#06b6d4",
  pink: "#ec4899",
  yellow: "#eab308",
};

function LucideIcon({ name, className }: { name?: DemoTile["icon"]; className?: string }) {
  if (!name) return null;
  const Icon = (Icons as any)[name as string];
  return Icon ? <Icon className={className} aria-hidden /> : null;
}

export default function DemoTileGrid({ title, subtitle, tiles, columns, onTileClick, className }: DemoTileGridProps) {
  const gridCols = clsx(
    "grid gap-4",
    (columns?.base ?? 1) === 1 ? "grid-cols-1" : `grid-cols-${columns?.base ?? 2}`,
    columns?.sm ? `sm:grid-cols-${columns.sm}` : "sm:grid-cols-2",
    columns?.md ? `md:grid-cols-${columns.md}` : "md:grid-cols-3",
    columns?.lg ? `lg:grid-cols-${columns.lg}` : "lg:grid-cols-4"
  );

  return (
    <section className={clsx("w-full", className)}>
      {(title || subtitle) && (
        <header className="mb-4">
          {title && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{title}</h2>
          )}
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </header>
      )}

      <div className={gridCols} role="grid" aria-label={title ?? "Demo tiles"}>
        {tiles.map((t, idx) => {
          const hex = t.accent ? accentHex[t.accent] : pickAccentByIndex(idx);
          const disabled = !!t.disabled;
          return (
            <button
              key={t.id}
              role="gridcell"
              aria-disabled={disabled || undefined}
              disabled={disabled}
              onClick={() => !disabled && (onTileClick ? onTileClick(t.href, t) : (window.location.href = t.href))}
              className={clsx(
                "group relative overflow-hidden rounded-2xl border transition-all focus:outline-none",
                "border-gray-200/70 dark:border-white/10",
                "bg-white dark:bg-gray-950",
                "hover:shadow-xl hover:-translate-y-[2px] active:translate-y-0",
                "text-left p-4 min-h-[120px]",
                disabled && "opacity-60 cursor-not-allowed"
              )}
              style={{ ["--accent" as any]: hex } as React.CSSProperties}
            >
              {/* Background accents */}
              <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
                <div
                  className="absolute -top-20 -right-16 h-44 w-44 rounded-full opacity-20 blur-2xl"
                  style={{ background: "radial-gradient(circle at 50% 50%, var(--accent), transparent 60%)" }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/2 opacity-50"
                  style={{ background: "linear-gradient(180deg, transparent, color-mix(in lab, var(--accent) 10%, white))" }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 flex items-start gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl border bg-white dark:bg-gray-950 dark:border-white/10"
                  style={{
                    borderColor: "color-mix(in lab, var(--accent) 24%, #dbeafe)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)",
                  }}
                >
                  <LucideIcon name={t.icon} className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {t.title}
                    </h3>
                    {t.badge != null && (
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1"
                        style={{
                          color: "color-mix(in lab, var(--accent) 70%, #000)",
                          background: "color-mix(in lab, var(--accent) 10%, #fff)",
                          borderColor: "color-mix(in lab, var(--accent) 25%, #dbeafe)",
                        }}
                      >
                        {t.badge}
                      </span>
                    )}
                  </div>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300 leading-snug truncate">
                      {t.description}
                    </p>
                  )}
                  {renderStatus(t.status)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function renderStatus(status: DemoTile["status"]) {
  if (!status) return null;
  const s = typeof status === "string" ? { text: status, tone: "neutral" as const } : status;
  const tone = s.tone ?? "neutral";
  const toneClass =
    tone === "success"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "warning"
      ? "text-amber-700 dark:text-amber-300"
      : tone === "danger"
      ? "text-rose-700 dark:text-rose-300"
      : tone === "info"
      ? "text-blue-700 dark:text-blue-300"
      : "text-gray-700 dark:text-gray-300";
  return <p className={clsx("mt-1 text-[11px] leading-tight", toneClass)}>{s.text}</p>;
}

function pickAccentByIndex(i: number) {
  const list = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#3b82f6", "#8b5cf6", "#14b8a6"];
  return list[i % list.length];
}

