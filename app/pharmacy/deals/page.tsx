import PageShell from '@/components/layouts/PageShell'
import { pharmacyNavItems } from '@/config/pharmacyNav'

export const dynamic = 'force-dynamic'

export default async function PharmacyDealsPage() {
  return (
    <PageShell sidebarItems={pharmacyNavItems} headerTitle="Deals & Specials" headerSubtitle="Promotions">
      <div className="p-6">
        <div className="rounded-lg border border-rose-200/70 dark:border-rose-800/40 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-2">Deals & Specials – Coming Soon</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">Daily specials and promotions will be available within 48 hours.</p>
        </div>
      </div>
    </PageShell>
  )
}

