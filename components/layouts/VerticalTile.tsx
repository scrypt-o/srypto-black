'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import clsx from 'clsx'

export type VerticalTileProps = {
  id: string
  title: string
  description?: string
  icon?: string
  href: string
  badge?: string | number
  // Optional status line (notifications) with optional tone for color
  status?: string | { text: string; tone?: 'neutral' | 'success' | 'warning' | 'info' | 'danger' }
  disabled?: boolean
  accent?: 'auto' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'fuchsia' | 'cyan' | 'blue' | 'purple' | 'teal' | 'pink' | 'yellow'
}

function IconByName({ name, className, style }: { name?: string; className?: string; style?: React.CSSProperties }) {
  if (!name) return null
  const Ico = (Icons as any)[name]
  return Ico ? <Ico className={className} style={style} aria-hidden /> : null
}

const accentClasses: Record<NonNullable<VerticalTileProps['accent']>, { border: string; badgeWrap: string }> = {
  auto: { border: 'border-gray-200', badgeWrap: 'bg-gray-100' },
  indigo:  { border: 'border-indigo-200',  badgeWrap: 'bg-indigo-50' },
  emerald: { border: 'border-emerald-200', badgeWrap: 'bg-emerald-50' },
  rose:    { border: 'border-rose-200',    badgeWrap: 'bg-rose-50' },
  amber:   { border: 'border-amber-200',   badgeWrap: 'bg-amber-50' },
  fuchsia: { border: 'border-fuchsia-200', badgeWrap: 'bg-fuchsia-50' },
  cyan:    { border: 'border-cyan-200',    badgeWrap: 'bg-cyan-50' },
  blue:    { border: 'border-blue-200',    badgeWrap: 'bg-blue-50' },
  purple:  { border: 'border-purple-200',  badgeWrap: 'bg-purple-50' },
  teal:    { border: 'border-teal-200',    badgeWrap: 'bg-teal-50' },
  pink:    { border: 'border-pink-200',    badgeWrap: 'bg-pink-50' },
  yellow:  { border: 'border-yellow-200',  badgeWrap: 'bg-yellow-50' },
}

const accentHex: Record<Exclude<NonNullable<VerticalTileProps['accent']>, 'auto'>, string> = {
  indigo: '#6366f1',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  fuchsia: '#d946ef',
  cyan: '#06b6d4',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  pink: '#ec4899',
  yellow: '#eab308',
}

export default function VerticalTile({ id, title, description = '', icon, href, badge, status, disabled, accent = 'auto' }: VerticalTileProps) {
  const ac = accentClasses[accent]
  const accentValue = accent === 'auto' ? '#94a3b8' : accentHex[accent]
  const tileStyle: CSSProperties = {
    // CSS variable for accent consumed by background layers
    ['--accent' as any]: accentValue
  }
  const iconWrapStyle: CSSProperties = {
    background: 'conic-gradient(from 210deg, color-mix(in lab, var(--accent) 12%, #fff), white)',
    borderColor: 'color-mix(in lab, var(--accent) 26%, #dfe8ff)',
    boxShadow: 'inset 0 1px 0 white, 0 8px 18px rgba(0,0,0,.08)'
  }
  const iconStyle: CSSProperties = { color: 'var(--accent)' }
  const badgeStyle: CSSProperties = {
    background: 'color-mix(in lab, var(--accent) 12%, white)',
    borderColor: 'color-mix(in lab, var(--accent) 30%, #e7eefc)',
    color: '#203050'
  }
  const content = (
    <div
      className={clsx(
        'group relative w-full rounded-2xl p-3 sm:p-4 text-left',
        'border bg-white dark:bg-gray-950 hover:shadow-[0_16px_38px_-14px_rgba(0,0,0,0.20)]',
        'transition-all duration-150',
        ac.border,
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      )}
      style={tileStyle}
    >
      {/* Background layers: light vs dark for better contrast (sit below content) */}
      <div aria-hidden className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
        {/* Light theme background */}
        <div className="absolute inset-0 dark:hidden" style={{
          background: 'radial-gradient(120% 120% at 0% 0%, color-mix(in lab, var(--accent) 14%, white), transparent 60%), linear-gradient(180deg, white, color-mix(in lab, var(--accent) 6%, white))'
        }} />
        {/* Dark theme background */}
        <div className="hidden dark:block absolute inset-0" style={{
          background: 'radial-gradient(120% 120% at 0% 0%, color-mix(in lab, var(--accent) 22%, #0b1220), transparent 58%), linear-gradient(180deg, #0b1220, color-mix(in lab, var(--accent) 10%, #0b1220))'
        }} />
        {/* Subtle top highlight overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.8), transparent 24%)', mixBlendMode: 'soft-light' as any, opacity: 0.65 }}
        />
      </div>
      <div className="grid grid-cols-[52px,1fr,auto] gap-3 items-center relative z-10">
        <div
          className={clsx('h-[52px] w-[52px] rounded-xl grid place-items-center', 'bg-white dark:bg-gray-950 border dark:border-white/10', ac.border)}
          style={iconWrapStyle}
        >
          {icon && <IconByName name={icon} className={clsx('h-6 w-6')} style={iconStyle} />}
        </div>
        <div className="min-w-0">
          <h3 className="m-0 text-[15px] sm:text-[16px] font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h3>
          {description && <p className="mt-1 text-[12px] sm:text-[13px] text-gray-600 dark:text-gray-300 truncate">{description}</p>}
          {(() => {
            if (!status) return null
            const s = typeof status === 'string' ? { text: status, tone: 'neutral' as const } : status
            const toneClass = s.tone === 'success'
              ? 'text-emerald-700 dark:text-emerald-300'
              : s.tone === 'warning'
              ? 'text-amber-700 dark:text-amber-300'
              : s.tone === 'danger'
              ? 'text-rose-700 dark:text-rose-300'
              : s.tone === 'info'
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300'
            return (
              <p className={clsx('mt-1 text-[12px] sm:text-[13px] truncate', toneClass)}>
                {s.text}
              </p>
            )
          })()}
        </div>
        <div className="flex items-center gap-2">
          {badge != null && (
            <span className={clsx('px-2 py-1 text-[11px] rounded-full border', ac.badgeWrap, ac.border)} style={badgeStyle}>
              {badge}
            </span>
          )}
          <Icons.ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    </div>
  )

  if (disabled) {
    return <div key={id} aria-disabled className="pointer-events-none">{content}</div>
  }

  return (
    <Link prefetch href={href} key={id} className="block">
      {content}
    </Link>
  )
}
