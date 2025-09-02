import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import EmergencyContactsListFeature from '@/components/features/patient/emergency-contacts/EmergencyContactsListFeature'

export const dynamic = 'force-dynamic'

export default async function EmergencyContactsListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await getServerClient()
  const spRaw = await searchParams

  const SortByEnum = z.enum(['created_at', 'name', 'relationship', 'is_primary'])
  const SortDirEnum = z.enum(['asc', 'desc'])
  const PageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    relationship: z.string().optional(),
    is_primary: z.coerce.boolean().optional(),
    sort_by: SortByEnum.optional(),
    sort_dir: SortDirEnum.optional(),
  })

  const sp = PageSchema.parse({
    page: (spRaw.page as string) ?? '1',
    pageSize: (spRaw.pageSize as string) ?? '20',
    search: (spRaw.search as string) || undefined,
    relationship: (spRaw.relationship as string) || undefined,
    is_primary: spRaw.is_primary === 'true' ? true : spRaw.is_primary === 'false' ? false : undefined,
    sort_by: (spRaw.sort_by as string) || undefined,
    sort_dir: (spRaw.sort_dir as string) || undefined,
  })

  let query = supabase
    .from('v_patient__persinfo__emrg_contacts')
    .select('*', { count: 'exact' })

  // Default sort: primary contacts first, then by creation date
  const sortBy = sp.sort_by ?? 'created_at'
  const sortDir = sp.sort_dir ?? 'desc'
  query = query.order('is_primary', { ascending: false })
           .order(sortBy, { ascending: sortDir === 'asc' })

  if (sp.search) {
    query = query.or(`name.ilike.%${sp.search}%,relationship.ilike.%${sp.search}%`)
  }
  if (sp.relationship) {
    query = query.eq('relationship', sp.relationship)
  }
  if (sp.is_primary !== undefined) {
    query = query.eq('is_primary', sp.is_primary)
  }

  const from = (sp.page - 1) * sp.pageSize
  const to = from + sp.pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Emergency Contacts">
      <EmergencyContactsListFeature
        initialData={error ? [] : (data || [])}
        total={error ? 0 : (count || 0)}
        initialState={{
          page: sp.page,
          pageSize: sp.pageSize,
          ...(sp.search ? { search: sp.search } : {}),
          ...(sp.relationship ? { relationship: sp.relationship } : {}),
          ...(sp.is_primary !== undefined ? { is_primary: sp.is_primary } : {}),
          sort_by: sortBy,
          sort_dir: sortDir,
        }}
      />
    </ListPageLayout>
  )
}
