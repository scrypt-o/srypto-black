'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Search,
  QrCode,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react'

export default function MobileFooter() {
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
    const isActive = (href && pathname === href) || (isHome && pathname === '/patient')

    // Base icon color per item for subtle color even when inactive
    const baseIconColor = id === 'scan'
      ? 'text-blue-500 dark:text-blue-300'
      : id === 'custom'
      ? 'text-indigo-500 dark:text-indigo-300'
      : id === 'home'
      ? 'text-slate-600 dark:text-slate-300'
      : id === 'search'
      ? 'text-teal-500 dark:text-teal-300'
      : 'text-fuchsia-500 dark:text-fuchsia-300' // ai

    // Active background tint per item
    const activeBg = id === 'scan'
      ? 'bg-blue-50 dark:bg-blue-900/15'
      : id === 'custom'
      ? 'bg-indigo-50 dark:bg-indigo-900/15'
      : id === 'home'
      ? 'bg-gray-100 dark:bg-white/10'
      : id === 'search'
      ? 'bg-teal-50 dark:bg-teal-900/15'
      : 'bg-fuchsia-50 dark:bg-fuchsia-900/15'

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
                placeholder="Search the app..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
              />
              <button onClick={() => setSearchOpen(false)} className="text-sm text-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom quick menu (small sliding sheet) */}
      <div className={`md:hidden fixed bottom-16 left-2 z-40 transition-transform ${customOpen ? 'translate-y-0' : 'translate-y-6 opacity-0 pointer-events-none'} `}>
        <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden">
          <button
            className="block px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/10 w-full"
            onClick={() => { setCustomOpen(false); router.push('/patient/deals') }}
          >
            Daily deals
          </button>
          <button
            className="block px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/10 w-full"
            onClick={() => { setCustomOpen(false); router.push('/patient/location/find-loved-ones') }}
          >
            Find my loved ones
          </button>
          <button
            className="block px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/10 w-full"
            onClick={() => { setCustomOpen(false); router.push('/patient/vitality') }}
          >
            Vitality
          </button>
        </div>
      </div>

      {/* Bottom App Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-t border-gray-200 dark:border-white/10 z-40">
        <div className="grid grid-cols-5 h-16 select-none">
          {/* Far left: Scan */}
          <ItemButton id="scan" label="Scan" icon={QrCode} href="/patient/presc/scan" activeColor="text-blue-600" />

          {/* Next: Custom (opens sheet) */}
          <ItemButton id="custom" label="Custom" icon={SlidersHorizontal} onClick={() => setCustomOpen((v) => !v)} activeColor="text-indigo-600" />

          {/* Center: Home */}
          <ItemButton id="home" label="Home" icon={Home} href="/patient" activeColor="text-gray-700" />

          {/* Between Home and AI: Search (opens modal) */}
          <ItemButton id="search" label="Search" icon={Search} onClick={() => setSearchOpen(true)} activeColor="text-gray-700" />

          {/* Far right: AI (sparkles icon) */}
          <ItemButton id="ai" label="AI" icon={Sparkles} href="/patient/chat" activeColor="text-fuchsia-600" />
        </div>
      </div>
    </>
  )
}
