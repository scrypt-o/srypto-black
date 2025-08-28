'use client'

import * as React from 'react'
import clsx from 'clsx'
import { Sparkles, ArrowUp, ArrowDown, Maximize2, Minimize2, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

type DockMode = 'min' | 'bottom' | 'top' | 'full'

export default function ChatDock() {
  const [mode, setMode] = React.useState<DockMode>('min')
  const pathname = usePathname()

  // Open dock automatically when navigating to the AI route; otherwise remain minimized.
  React.useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith('/patient/chat')) {
      setMode('bottom')
    } else {
      setMode('min')
    }
  }, [pathname])

  const toBottom = () => setMode('bottom')
  const toTop = () => setMode('top')
  const toggleTopBottom = () => setMode((m) => (m === 'top' ? 'bottom' : 'top'))
  const toggleFull = () => setMode((m) => (m === 'full' ? 'bottom' : 'full'))
  const minimize = () => setMode('min')

  const panelPos = clsx(
    'fixed left-0 right-0 z-50 transition-all duration-200 ease-out',
    mode === 'bottom' && 'bottom-0 top-1/2',
    mode === 'top' && 'top-0 bottom-1/2',
    mode === 'full' && 'inset-0',
    mode === 'min' && 'pointer-events-none opacity-0'
  )

  const showPanel = mode !== 'min'

  return (
    <>
      {/* Panel */}
      {showPanel && (
        <section
          className={panelPos}
          role="dialog"
          aria-label="Chat"
        >
          <div className="relative h-full w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur border-t border-gray-200 dark:border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-3 md:px-4 h-12 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white"><Sparkles className="h-4 w-4" /></span>
                Assistant
              </div>
              <div className="flex items-center gap-1.5">
                {/* Dock position toggle */}
                <button
                  type="button"
                  onClick={toggleTopBottom}
                  className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label={mode === 'top' ? 'Dock to bottom' : 'Dock to top'}
                  title={mode === 'top' ? 'Dock to bottom' : 'Dock to top'}
                >
                  {mode === 'top' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                </button>
                {/* Fullscreen toggle */}
                <button
                  type="button"
                  onClick={toggleFull}
                  className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label={mode === 'full' ? 'Exit fullscreen' : 'Fullscreen'}
                  title={mode === 'full' ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {mode === 'full' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                {/* Minimize */}
                <button
                  type="button"
                  onClick={minimize}
                  className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label="Minimize"
                  title="Minimize"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content placeholder */}
            <div className="h-[calc(100%-3rem)] p-3 md:p-4 overflow-y-auto">
              <div className="mx-auto max-w-3xl">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>Chat UI placeholder — connect your assistant here.</p>
                </div>
                {/* Example message area */}
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-800 dark:text-gray-200 w-fit max-w-[85%]">
                    Hello! How can I help you today?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
