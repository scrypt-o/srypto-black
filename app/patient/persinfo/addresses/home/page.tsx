import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import AddressEditForm from '@/components/features/patient/persinfo/AddressEditForm'

export const dynamic = 'force-dynamic'

export default async function HomeAddressPage() {
  const supabase = await getServerClient()
  // Try DDL-aligned singular view, fallback to legacy plural
  let { data, error } = await supabase
    .from('v_patient__persinfo__address')
    .select('*')
    .single()
  if (error) {
    const res = await supabase
      .from('v_patient__persinfo__addresses')
      .select('*')
      .eq('address_type', 'home')
      .single()
    data = res.data
    error = null
  }

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Home Address">
      {error && <div className="p-4 text-red-600">Failed to load home address</div>}
      <AddressEditForm 
        title="Home Address"
        type="home"
        initial={{
          address1: (data as any)?.home_address1 || (data as any)?.line1 || undefined,
          address2: (data as any)?.home_address2 || (data as any)?.line2 || undefined,
          street_no: (data as any)?.home_street_no,
          street_name: (data as any)?.home_street_name,
          suburb: (data as any)?.home_suburb,
          city: (data as any)?.home_city || (data as any)?.city,
          province: (data as any)?.home_province || (data as any)?.region,
          postal_code: (data as any)?.home_postal_code || (data as any)?.postal_code,
          country: (data as any)?.home_country || (data as any)?.country,
        }}
      />
    </PageShell>
  )
}
