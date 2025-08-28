'use client'

import * as React from 'react'
import * as Icons from 'lucide-react'
import VerticalTile from './VerticalTile'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

// CSS transitions for hover effects - no external dependencies

/** ---------- Types ---------- */
export type TileVariant = 'default' | 'highlighted' | 'subtle' | 'warning'
export type Tile = {
  id: string
  title: string
  description?: string
  icon?: string          // Lucide icon name, e.g., "User"
  href: string
  badge?: string | number
  // Optional status line shown under description (notifications, summaries)
  status?: string | { text: string; tone?: 'neutral' | 'success' | 'warning' | 'info' | 'danger' }
  disabled?: boolean
  variant?: TileVariant
  color?: string         // Custom color classes
  // Optional accent to drive icon/background tint (matches VerticalTile)
  accent?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'fuchsia' | 'cyan' | 'blue' | 'purple' | 'teal' | 'pink' | 'yellow'
}

export type Breadcrumb = { label: string; href: string }
export type QuickAction = { id: string; label: string; action: string }

export type TileGridLayoutProps = {
  title: string
  subtitle?: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  tiles: Tile[]
  quickActions?: QuickAction[]
  loading?: boolean
  style?: 'flat' | 'elevated' | 'glass'         // visual style (default 'flat')
  onTileClick?: (href: string, tile: Tile) => void
  onQuickAction?: (action: string) => void
  orientation?: 'grid' | 'vertical'
}

// For backward compatibility with existing code
export interface TileGridConfig {
  title: string
  subtitle?: string
  description?: string
  breadcrumbs?: Array<{ label: string; href: string }>
  tiles: Array<{
    id: string
    title: string
    description: string
    icon: string
    href: string
    color?: string
    badge?: string | number
    status?: string | { text: string; tone?: 'neutral' | 'success' | 'warning' | 'info' | 'danger' }
    disabled?: boolean
    variant?: 'default' | 'highlighted' | 'subtle' | 'warning'
    accent?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'fuchsia' | 'cyan' | 'blue' | 'purple' | 'teal' | 'pink' | 'yellow'
  }>
  quickActions?: Array<{
    id: string
    label: string
    action: string
  }>
  layout?: {
    columns?: { mobile: number; tablet: number; desktop: number }
    spacing?: 'tight' | 'normal' | 'loose'
    showQuickActions?: boolean
    showBreadcrumbs?: boolean
  }
  authentication?: {
    required?: boolean
    redirectTo?: string
  }
  tracking?: {
    page?: string
    category?: string
  }
}

/** ---------- Helpers ---------- */
function LucideIcon({ name, className, style }: { name?: string; className?: string; style?: React.CSSProperties }) {
  if (!name) return null
  const Icon = (Icons as any)[name]
  return Icon ? <Icon className={className} style={style} aria-hidden="true" /> : null
}

const variantClasses: Record<TileVariant, { wrapper: string; iconWrap: string; text: string; badgeWrap: string; badgeText: string }> = {
  default: {
    wrapper: 'bg-white border-gray-200 dark:bg-gray-900/60 dark:border-white/10',
    iconWrap: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-gray-900 dark:text-gray-100',
    badgeWrap: 'bg-blue-50 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-200',
  },
  highlighted: {
    wrapper: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/60',
    iconWrap: 'bg-white/70 dark:bg-white/10',
    text: 'text-blue-900 dark:text-blue-200',
    badgeWrap: 'bg-blue-100 dark:bg-blue-900/40',
    badgeText: 'text-blue-700 dark:text-blue-100',
  },
  subtle: {
    wrapper: 'bg-gray-50 border-gray-100 dark:bg-gray-900/40 dark:border-white/5',
    iconWrap: 'bg-white dark:bg-white/5',
    text: 'text-gray-800 dark:text-gray-200',
    badgeWrap: 'bg-gray-100 dark:bg-gray-800/60',
    badgeText: 'text-gray-700 dark:text-gray-200',
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/60',
    iconWrap: 'bg-white/70 dark:bg-white/10',
    text: 'text-amber-900 dark:text-amber-200',
    badgeWrap: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-800 dark:text-amber-100',
  },
}

const styleBase = {
  flat: 'border shadow-[0_1px_0_0_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.10)]',
  elevated: 'border shadow-md hover:shadow-lg',
  glass: 'border bg-white/80 backdrop-blur dark:bg-gray-900/60 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.25)]',
}

// Accent hex colors used to lightly tint grid tiles similar to vertical tiles
const accentHex: Record<string, string> = {
  communications: '#6366f1', // indigo
  'personal-info': '#10b981', // emerald
  prescriptions: '#f43f5e', // rose
  medications: '#f59e0b', // amber
  vitality: '#d946ef', // fuchsia
  'care-network': '#06b6d4', // cyan
  medhist: '#3b82f6', // blue
  'lab-results': '#8b5cf6', // purple
  location: '#14b8a6', // teal
  deals: '#ec4899', // pink
  rewards: '#eab308', // yellow
}
const DEFAULT_ACCENT = '#94a3b8' // slate-400

const accentByName: Record<NonNullable<Tile['accent']>, string> = {
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

/** ---------- Component ---------- */
export default function TileGridLayout(props: TileGridLayoutProps & { config?: TileGridConfig }) {
  // Handle both new props and legacy config prop
  const {
    config,
    title = config?.title || '',
    subtitle = config?.subtitle,
    description = config?.description,
    breadcrumbs = config?.breadcrumbs,
    tiles = config?.tiles || [],
    quickActions = config?.quickActions,
    loading,
    style = 'flat',
    onTileClick,
    onQuickAction,
    orientation = 'grid'
  } = props

  const router = useRouter()
  // Match tile icon colors to sidebar group icon colors by id
  const groupIconColors: Record<string, string> = {
    communications: 'text-indigo-600 dark:text-indigo-400',
    'personal-info': 'text-emerald-600 dark:text-emerald-400',
    prescriptions: 'text-rose-600 dark:text-rose-400',
    medications: 'text-amber-600 dark:text-amber-400',
    vitality: 'text-fuchsia-600 dark:text-fuchsia-400',
    'care-network': 'text-cyan-600 dark:text-cyan-400',
    medhist: 'text-blue-600 dark:text-blue-400',
    'lab-results': 'text-purple-600 dark:text-purple-400',
    location: 'text-teal-600 dark:text-teal-400',
    deals: 'text-pink-600 dark:text-pink-400',
    rewards: 'text-yellow-600 dark:text-yellow-400',
  }
  const activate = (tile: Tile) => {
    if (tile.disabled) return
    if (onTileClick) return onTileClick(tile.href, tile)
    router.push(tile.href)
  }

  // Simple div with CSS transitions for hover effects

  // Vertical orientation renders premium list-style tiles
  if (orientation === 'vertical') {
    return (
      <section className="w-full">
        {(title || subtitle || description || (quickActions && quickActions.length > 0)) && (
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              {title && <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
              {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
            </div>
          </header>
        )}

        <div className="flex flex-col gap-3">
          {tiles.map((t) => (
            <VerticalTile
              key={t.id}
              id={t.id}
              title={t.title}
              {...(t.description ? { description: t.description } : {})}
              {...(t.icon ? { icon: t.icon } : {})}
              href={t.href}
              {...(t.badge != null ? { badge: t.badge } : {})}
              {...(t.status ? { status: t.status } : {})}
              {...(t.disabled ? { disabled: t.disabled } : {})}
              accent={
                t.id === 'communications' ? 'indigo' :
                t.id === 'personal-info' ? 'emerald' :
                t.id === 'prescriptions' ? 'rose' :
                t.id === 'medications' ? 'amber' :
                t.id === 'vitality' ? 'fuchsia' :
                t.id === 'care-network' ? 'cyan' :
                t.id === 'medhist' ? 'blue' :
                t.id === 'lab-results' ? 'purple' :
                t.id === 'location' ? 'teal' :
                t.id === 'deals' ? 'pink' :
                t.id === 'rewards' ? 'yellow' : 'auto'
              }
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="w-full">
      {/* Breadcrumbs */}
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          <ol className="flex flex-wrap items-center gap-2">
            {breadcrumbs.map((b, i) => (
              <li key={`${b.href}-${i}`} className="inline-flex items-center">
                <a href={b.href} className="hover:underline">{b.label}</a>
                {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {/* Header (only render if content exists) */}
      {(title || subtitle || description || (quickActions && quickActions.length > 0)) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
            {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
          {quickActions?.length ? (
            <div className="flex flex-wrap gap-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.id}
                  data-testid={`quick-action-${qa.id}`}
                  type="button"
                  onClick={() => onQuickAction?.(qa.action)}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          ) : null}
        </header>
      )}

      {/* Grid */}
      <div
        data-testid="tile-grid"
        role="grid"
        aria-label={title}
        className={clsx(
          'grid gap-3',
          'grid-cols-2',     // mobile - 2 columns
          'sm:grid-cols-3',  // small tablet
          'md:grid-cols-4',  // tablet
          'lg:grid-cols-4'   // desktop
        )}
      >
        {tiles.map((tile) => {
          const variant = tile.variant ?? 'default'
          const v = variantClasses[variant]
          const disabled = !!tile.disabled
          // Determine accent color (prop > id mapping > href heuristics > default)
          let hex: string | undefined = tile.accent ? accentByName[tile.accent] : undefined
          if (!hex) hex = (accentHex as any)[tile.id]
          if (!hex && tile.href) {
            const h = tile.href
            hex = h.includes('/patient/medhist') ? accentByName.blue
              : h.includes('/patient/persinfo') ? accentByName.emerald
              : h.includes('/patient/presc') ? accentByName.rose
              : h.includes('/patient/medications') ? accentByName.amber
              : h.includes('/patient/vitality') ? accentByName.fuchsia
              : h.includes('/patient/care-network') ? accentByName.cyan
              : h.includes('/patient/labresults') ? accentByName.purple
              : h.includes('/patient/location') ? accentByName.teal
              : h.includes('/patient/deals') ? accentByName.pink
              : h.includes('/patient/rewards') ? accentByName.yellow
              : h.includes('/patient/comm') ? accentByName.indigo
              : undefined
          }
          if (!hex) hex = DEFAULT_ACCENT
          const iconWrapStyle: React.CSSProperties = {
            background: 'conic-gradient(from 210deg, color-mix(in lab, var(--accent) 12%, #fff), white)',
            borderColor: 'color-mix(in lab, var(--accent) 26%, #dfe8ff)',
            boxShadow: 'inset 0 1px 0 white, 0 8px 18px rgba(0,0,0,.08)'
          }
          const iconStyle: React.CSSProperties = { color: 'var(--accent)' }

          const commonProps = {
            role: "gridcell" as const,
            tabIndex: disabled ? -1 : 0,
            "aria-disabled": disabled || undefined,
            onClick: () => activate(tile),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (disabled) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                activate(tile)
              }
            }
          }

          // CSS transitions handle hover/tap effects
          
          return (
            <div
              key={tile.id}
              {...commonProps}
              className={clsx(
                'relative overflow-hidden rounded-lg p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/70',
                'min-h-[110px] border',
                tile.color ? tile.color : v.wrapper,
                styleBase[style],
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                !disabled && 'hover:shadow-md active:scale-[0.98]'
              )}
              style={{ ['--accent' as any]: hex } as React.CSSProperties}
            >
              {/* Accent background layers */}
              <div aria-hidden className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 dark:hidden" style={{
                  background: 'radial-gradient(120% 120% at 0% 0%, color-mix(in lab, var(--accent) 14%, white), transparent 60%), linear-gradient(180deg, white, color-mix(in lab, var(--accent) 6%, white))'
                }} />
                <div className="hidden dark:block absolute inset-0" style={{
                  background: 'radial-gradient(120% 120% at 0% 0%, color-mix(in lab, var(--accent) 20%, #0b1220), transparent 58%), linear-gradient(180deg, #0b1220, color-mix(in lab, var(--accent) 10%, #0b1220))'
                }} />
              </div>

              <div className="relative z-10 flex flex-col gap-2">
                <div className={clsx(
                  'relative flex h-10 w-10 items-center justify-center rounded-lg',
                  'bg-white dark:bg-gray-950 border dark:border-white/10'
                )} style={iconWrapStyle}>
                  {tile.icon ? (
                    <LucideIcon
                      name={tile.icon}
                      className={clsx('h-5 w-5')}
                      // Use accent color for icon for a livelier look
                      // eslint-disable-next-line react/style-prop-object
                      style={iconStyle}
                    />
                  ) : null}
                </div>
                <div>
                  <h3 className={clsx('text-sm font-medium text-gray-900 leading-tight', tile.color ? '' : v.text)}>{tile.title}</h3>
                  {tile.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-tight">{tile.description}</p>
                  )}
                  {(() => {
                    if (!tile.status) return null
                    const s = typeof tile.status === 'string' ? { text: tile.status, tone: 'neutral' as const } : tile.status
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
                      <p className={clsx('text-[11px] mt-1 leading-tight', toneClass)}>{s.text}</p>
                    )
                  })()}
                </div>
              </div>
              {tile.badge != null && (
                <span className={clsx(
                  'mt-3 inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1',
                  v.badgeWrap, v.badgeText, 'ring-inset ring-black/5 dark:ring-white/10'
                )}>
                  {tile.badge}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-black/40"
        >
          <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 h-10 w-10" />
        </div>
      )}
    </section>
  )
}
