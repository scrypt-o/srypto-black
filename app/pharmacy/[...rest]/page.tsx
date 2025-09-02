import PageShell from '@/components/layouts/PageShell'
import { pharmacyNavItems } from '@/config/pharmacyNav'

export const dynamic = 'force-dynamic'

export default async function PharmacyComingSoonPage({ params }: { params: Promise<{ rest?: string[] }> }) {
  const resolved = await params
  const path = '/' + (resolved.rest?.join('/') ?? '')

  return (
    <PageShell
      sidebarItems={pharmacyNavItems}
      headerTitle="Coming Soon"
      headerSubtitle="Pharmacy Portal"
    >
      <div className="p-6">
        <div className="max-w-2xl rounded-lg border border-rose-200/70 dark:border-rose-800/40 bg-rose-50/60 dark:bg-rose-900/10 p-6">
          <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-2">This page will be ready within 48 hours</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            We’re preparing <span className="font-medium">{path}</span> for the Pharmacy Portal. Please check back soon.
          </p>
        </div>
      </div>
    </PageShell>
  )
}

