import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import AddressDetailFeature from '@/components/features/patient/persinfo/AddressDetailFeature'

export const dynamic = 'force-dynamic'

export default async function DeliveryAddressPage() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_patient__persinfo__addresses')
    .select('*')
    .eq('address_type', 'delivery')
    .single()

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Delivery Address">
      {error && <div className="p-4 text-red-600">Failed to load delivery address</div>}
      <AddressDetailFeature title="Delivery Address" record={data ?? null} />
    </PageShell>
  )
}

