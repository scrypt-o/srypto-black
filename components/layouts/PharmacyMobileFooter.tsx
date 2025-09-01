'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Search,
  Inbox,
  Sparkles,
  SlidersHorizontal,
  Users,
  Package,
  BarChart3
} from 'lucide-react'

export default function PharmacyMobileFooter() {
  const pathname = usePathname()
  const router = useRouter()
  const [customOpen, setCustomOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  const ItemButton: React.FC<{
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    href?: string
    onClick?: () => void
    activeColor?: string
  }> = ({ id, label, icon: Icon, href, onClick, activeColor = 'text-blue-600' }) => {
    const isHome = id === 'home'
    const isActive = (href && pathname === href) || (isHome && pathname === '/pharmacy')

    // Base icon color per item for subtle color even when inactive
    const baseIconColor = id === 'inbox'
      ? 'text-red-500 dark:text-red-300'
      : id === 'custom'
      ? 'text-indigo-500 dark:text-indigo-300'
      : id === 'home'
      ? 'text-slate-600 dark:text-slate-300'
      : id === 'search'
      ? 'text-teal-500 dark:text-teal-300'
      : 'text-purple-500 dark:text-purple-300' // reports

    // Active background tint per item
    const activeBg = id === 'inbox'
      ? 'bg-red-50 dark:bg-red-900/15'
      : id === 'custom'
      ? 'bg-indigo-50 dark:bg-indigo-900/15'
      : id === 'home'
      ? 'bg-gray-100 dark:bg-white/10'
      : id === 'search'
      ? 'bg-teal-50 dark:bg-teal-900/15'
      : 'bg-purple-50 dark:bg-purple-900/15'

    const containerBg = isActive
      ? activeBg
      : 'hover:bg-gray-50 dark:hover:bg-white/10'

    const iconColor = isActive ? activeColor.replace('600', '700') : baseIconColor

    const content = (
      <div className={`flex flex-col items-center justify-center gap-1 ${containerBg} h-full w-full`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <span className={`text-[10px] font-medium ${isActive ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'}`}>{label}</span>
      </div>
    )
    if (href) {
      return (
        <Link href={href} className="w-full h-full">
          {content}
        </Link>
      )
    }
    return (
      <button type="button" onClick={onClick} className="w-full h-full">
        {content}
      </button>
    )
  }

  return (
    <>
      {/* Search Modal */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSearchOpen(false)} />
          <div className="absolute inset-x-4 top-20 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-xl p-3">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                autoFocus
                type="search"
                placeholder="Search pharmacy..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
              />
              <button onClick={() => setSearchOpen(false)} className="text-sm text-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom quick menu (pharmacy specific) */}
      <div className={`md:hidden fixed bottom-16 left-2 z-40 transition-transform ${customOpen ? 'translate-y-0' : 'translate-y-6 opacity-0 pointer-events-none'} `}>
        <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden min-w-[200px]">
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-left w-full hover:bg-blue-50 dark:hover:bg-blue-900/15"
            onClick={() => { setCustomOpen(false); router.push('/pharmacy/staff') }}
          >
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            <span className="text-gray-800 dark:text-gray-100">Staff Management</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-left w-full hover:bg-orange-50 dark:hover:bg-orange-900/15"
            onClick={() => { setCustomOpen(false); router.push('/pharmacy/inventory') }}
          >
            <Package className="h-4 w-4 text-orange-600 dark:text-orange-300" />
            <span className="text-gray-800 dark:text-gray-100">Inventory</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-left w-full hover:bg-purple-50 dark:hover:bg-purple-900/15"
            onClick={() => { setCustomOpen(false); router.push('/pharmacy/reports') }}
          >
            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            <span className="text-gray-800 dark:text-gray-100">Reports</span>
          </button>
        </div>
      </div>

      {/* Bottom App Bar - Pharmacy Context */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-t border-gray-200 dark:border-white/10 z-40">
        <div className="grid grid-cols-5 h-16 select-none">
          {/* Far left: Inbox */}
          <ItemButton id="inbox" label="Inbox" icon={Inbox} href="/pharmacy/prescriptions/inbox" activeColor="text-red-600" />

          {/* Next: Custom (opens sheet) */}
          <ItemButton id="custom" label="Quick" icon={SlidersHorizontal} onClick={() => setCustomOpen((v) => !v)} activeColor="text-indigo-600" />

          {/* Center: Dashboard */}
          <ItemButton id="home" label="Dashboard" icon={Home} href="/pharmacy" activeColor="text-gray-700" />

          {/* Between Dashboard and Reports: Search (opens modal) */}
          <ItemButton id="search" label="Search" icon={Search} onClick={() => setSearchOpen(true)} activeColor="text-gray-700" />

          {/* Far right: Reports */}
          <ItemButton id="reports" label="Reports" icon={BarChart3} href="/pharmacy/reports" activeColor="text-purple-600" />
        </div>
      </div>
    </>
  )
}