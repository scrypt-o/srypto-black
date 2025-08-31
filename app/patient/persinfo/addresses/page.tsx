import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export const dynamic = 'force-dynamic'

export default async function AddressesTilesPage() {
  const tiles = {
    title: 'Addresses',
    subtitle: 'Manage your home, postal and delivery addresses',
    description: 'Each address is unique (one record per type).',
    tiles: [
      {
        id: 'home-address',
        title: 'Home Address',
        description: 'Primary residence address',
        icon: 'Home',
        href: '/patient/persinfo/addresses/home',
        variant: 'highlighted' as const,
        color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
      },
      {
        id: 'postal-address',
        title: 'Postal Address',
        description: 'Mailing address with map',
        icon: 'Mailbox',
        href: '/patient/persinfo/addresses/postal',
        variant: 'default' as const,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
      },
      {
        id: 'delivery-address',
        title: 'Delivery Address',
        description: 'For deliveries and pickups',
        icon: 'Package',
        href: '/patient/persinfo/addresses/delivery',
        variant: 'default' as const,
        color: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
      },
    ]
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Addresses"
      headerSubtitle="Unique records for Home, Postal, Delivery"
      tileConfig={tiles}
    />
  )
}
