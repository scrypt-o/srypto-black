import TilePageLayoutClient from '@/components/layouts/TilePageLayoutClient'
import type { TileGridLayoutProps } from '@/components/layouts/TileGridLayout'

export default function DemoUiPage() {
  const sidebarItems = [
    { id: 'communications', label: 'Communications', href: '/patient/comm', icon: 'MessageSquare' },
    { id: 'persinfo', label: 'Personal Info', href: '/patient/persinfo', icon: 'User' },
    { id: 'medhist', label: 'Medical History', href: '/patient/medhist', icon: 'ClipboardList' },
    { id: 'medications', label: 'Medications', href: '/patient/medications', icon: 'Pill' },
  ]

  const tileConfig: TileGridLayoutProps = {
    title: 'Quick Access',
    subtitle: 'Your health shortcuts',
    tiles: [
      { id: 'communications', title: 'Messages', description: 'Alerts and notifications', icon: 'Bell', href: '/patient/comm', badge: 3, status: { text: '2 unread', tone: 'info' } },
      { id: 'persinfo', title: 'Profile', description: 'Addresses, dependents, medical aid', icon: 'User', href: '/patient/persinfo' },
      { id: 'medhist', title: 'Medical History', description: 'Allergies, conditions, surgeries', icon: 'ClipboardList', href: '/patient/medhist' },
      { id: 'medications', title: 'Medications', description: 'Active + adherence', icon: 'Pill', href: '/patient/medications' },
      { id: 'location', title: 'Find Care', description: 'Nearest services + maps', icon: 'MapPin', href: '/patient/location' },
      { id: 'rewards', title: 'Rewards', description: 'Earn progress', icon: 'Gift', href: '/patient/rewards', badge: 'New' },
    ],
    style: 'glass',
    expressive: true,
    composition: 'hero',
  }

  return (
    <TilePageLayoutClient
      sidebarItems={sidebarItems}
      sidebarTitle="Patient Portal"
      headerTitle="Scrypto"
      headerSubtitle="Safer, smarter patient care"
      tileConfig={tileConfig}
      tileOrientation="grid"
      contentHeading="Welcome back"
      contentSubheading="Jump into key tasks or explore your care hub"
      contentNote="Demo view — hero header + expressive tiles"
      tilesExpressive
      tileComposition="hero"
      style="flat"
      accent="healthcare"
    />
  )
}

