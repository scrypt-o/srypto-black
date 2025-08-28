'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Search, 
  QrCode,
  MessageSquare 
} from 'lucide-react'

export default function MobileFooter() {
  const pathname = usePathname()
  
  const items = [
    { 
      id: 'scan', 
      label: 'Scan', 
      icon: QrCode, 
      href: '/patient/presc/scan',
      color: 'text-blue-600'
    },
    { 
      id: 'search', 
      label: 'Search', 
      icon: Search, 
      href: '/patient/search',
      color: 'text-gray-600'
    },
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      href: '/patient',
      color: 'text-gray-600'
    },
    { 
      id: 'chat', 
      label: 'AI Help', 
      icon: MessageSquare, 
      href: '/patient/chat',
      color: 'text-green-600'
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
                          (item.id === 'home' && pathname === '/patient')
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-colors duration-200
                ${isActive 
                  ? item.color.replace('600', '700') + ' bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}