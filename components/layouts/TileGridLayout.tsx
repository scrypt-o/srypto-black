'use client'

import * as React from 'react'
import * as Icons from 'lucide-react'
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
  disabled?: boolean
  variant?: TileVariant
  color?: string         // Custom color classes
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
    disabled?: boolean
    variant?: 'default' | 'highlighted' | 'subtle' | 'warning'
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
function LucideIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null
  const Icon = (Icons as any)[name]
  return Icon ? <Icon className={className} aria-hidden="true" /> : null
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
  } = props

  const router = useRouter()
  const activate = (tile: Tile) => {
    if (tile.disabled) return
    if (onTileClick) return onTileClick(tile.href, tile)
    router.push(tile.href)
  }

  // Simple div with CSS transitions for hover effects

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

      {/* Header */}
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
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
                'rounded-lg p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/70',
                'min-h-[100px] border',
                tile.color ? tile.color : v.wrapper,
                styleBase[style],
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                !disabled && 'hover:shadow-md active:scale-[0.98]'
              )}
            >
              <div className="flex flex-col gap-2">
                <div className={clsx(
                  'relative flex h-10 w-10 items-center justify-center rounded-lg',
                  tile.color ? 'bg-white/50' : v.iconWrap
                )}>
                  {tile.icon ? (
                    <LucideIcon name={tile.icon} className="h-5 w-5 text-gray-700" />
                  ) : null}
                </div>
                <div>
                  <h3 className={clsx('text-sm font-medium text-gray-900 leading-tight', tile.color ? '' : v.text)}>{tile.title}</h3>
                  {tile.description && (
                    <p className="text-xs text-gray-600 mt-0.5 leading-tight">{tile.description}</p>
                  )}
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
