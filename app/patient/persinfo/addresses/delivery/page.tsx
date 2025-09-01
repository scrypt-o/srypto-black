import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import AddressEditForm from '@/components/features/patient/persinfo/AddressEditForm'

export const dynamic = 'force-dynamic'

export default async function DeliveryAddressPage() {
  const supabase = await getServerClient()
  let { data, error } = await supabase
    .from('v_patient__persinfo__address')
    .select('*')
    .single()
  if (error) {
    const res = await supabase
      .from('v_patient__persinfo__addresses')
      .select('*')
      .eq('address_type', 'delivery')
      .single()
    data = res.data
    error = null
  }

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Delivery Address">
      {error && <div className="p-4 text-red-600">Failed to load delivery address</div>}
      <AddressEditForm 
        title="Delivery Address"
        type="delivery"
        initial={{
          address1: (data as any)?.delivery_address1 || (data as any)?.line1 || undefined,
          address2: (data as any)?.delivery_address2 || (data as any)?.line2 || undefined,
          street_no: (data as any)?.delivery_street_no,
          street_name: (data as any)?.delivery_street_name,
          suburb: (data as any)?.delivery_suburb,
          city: (data as any)?.delivery_city || (data as any)?.city,
          province: (data as any)?.delivery_province || (data as any)?.region,
          postal_code: (data as any)?.delivery_postal_code || (data as any)?.postal_code,
          country: (data as any)?.delivery_country || (data as any)?.country,
        }}
      />
    </PageShell>
  )
}
