import { getServerClient } from '@/lib/supabase-server'
import AddressPageLayout from '@/components/layouts/AddressPageLayout'
import { patientNavItems } from '@/config/patientNav'
import AddressEditForm from '@/components/features/patient/persinfo/AddressEditForm'

export const dynamic = 'force-dynamic'

export default async function PostalAddressPage() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_patient__persinfo__address')
    .select('*')
    .single()

  return (
    <AddressPageLayout sidebarItems={patientNavItems} headerTitle="Postal Address">
      {error && <div className="p-4 text-red-600">Failed to load postal address</div>}
      <AddressEditForm 
        title="Postal Address"
        type="postal"
        initial={{
          address1: (data as any)?.postal_address1 || (data as any)?.line1 || undefined,
          address2: (data as any)?.postal_address2 || (data as any)?.line2 || undefined,
          street_no: (data as any)?.postal_street_no,
          street_name: (data as any)?.postal_street_name,
          suburb: (data as any)?.postal_suburb,
          city: (data as any)?.postal_city || (data as any)?.city,
          province: (data as any)?.postal_province || (data as any)?.region,
          postal_code: (data as any)?.postal_postal_code || (data as any)?.postal_code,
          country: (data as any)?.postal_country || (data as any)?.country,
        }}
      />
    </AddressPageLayout>
  )
}
