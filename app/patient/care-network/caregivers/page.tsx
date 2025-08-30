import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import CaregiversListFeature from '@/components/features/patient/caregivers/CaregiversListFeature'

export const dynamic = 'force-dynamic'

export default async function CaregiversListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await getServerClient()
  const spRaw = await searchParams

  const SortByEnum = z.enum(['created_at', 'first_name', 'last_name', 'relationship', 'access_level'])
  const SortDirEnum = z.enum(['asc', 'desc'])
  const PageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    relationship: z.string().optional(),
    access_level: z.string().optional(),
    emergency_contact: z.string().optional(),
    sort_by: SortByEnum.optional(),
    sort_dir: SortDirEnum.optional(),
  })

  const sp = PageSchema.parse({
    page: (spRaw.page as string) ?? '1',
    pageSize: (spRaw.pageSize as string) ?? '20',
    search: (spRaw.search as string) || undefined,
    relationship: (spRaw.relationship as string) || undefined,
    access_level: (spRaw.access_level as string) || undefined,
    emergency_contact: (spRaw.emergency_contact as string) || undefined,
    sort_by: (spRaw.sort_by as string) || undefined,
    sort_dir: (spRaw.sort_dir as string) || undefined,
  })

  let query = supabase
    .from('v_patient__carenet__caregivers')
    .select('*', { count: 'exact' })

  const sortBy = sp.sort_by ?? 'first_name'
  const sortDir = sp.sort_dir ?? 'asc'
  query = query.order(sortBy, { ascending: sortDir === 'asc' })

  if (sp.search) {
    query = query.or(`first_name.ilike.%${sp.search}%,last_name.ilike.%${sp.search}%,phone.ilike.%${sp.search}%,email.ilike.%${sp.search}%`)
  }
  if (sp.relationship) {
    query = query.eq('relationship', sp.relationship)
  }
  if (sp.access_level) {
    query = query.eq('access_level', sp.access_level)
  }
  if (sp.emergency_contact) {
    query = query.eq('emergency_contact', sp.emergency_contact)
  }

  const from = (sp.page - 1) * sp.pageSize
  const to = from + sp.pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <CaregiversListFeature
        initialData={error ? [] : (data || [])}
        total={error ? 0 : (count || 0)}
        initialState={{
          page: sp.page,
          pageSize: sp.pageSize,
          ...(sp.search ? { search: sp.search } : {}),
          ...(sp.relationship ? { relationship: sp.relationship } : {}),
          ...(sp.access_level ? { access_level: sp.access_level } : {}),
          ...(sp.emergency_contact ? { emergency_contact: sp.emergency_contact } : {}),
          sort_by: sortBy,
          sort_dir: sortDir,
        }}
      />
    </ListPageLayout>
  )
}