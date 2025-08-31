import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import ActiveMedicationsListFeature from '@/components/features/medications/ActiveMedicationsListFeature'

export const dynamic = 'force-dynamic'

export default async function ActiveMedicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await getServerClient()
  const spRaw = await searchParams

  const SortByEnum = z.enum(['created_at', 'medication_name', 'status', 'frequency', 'start_date'])
  const SortDirEnum = z.enum(['asc', 'desc'])
  const PageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    status: z.string().optional(),
    route: z.string().optional(),
    sort_by: SortByEnum.optional(),
    sort_dir: SortDirEnum.optional(),
  })

  const sp = PageSchema.parse({
    page: (spRaw.page as string) ?? '1',
    pageSize: (spRaw.pageSize as string) ?? '20',
    search: (spRaw.search as string) || undefined,
    status: (spRaw.status as string) || undefined,
    route: (spRaw.route as string) || undefined,
    sort_by: (spRaw.sort_by as string) || undefined,
    sort_dir: (spRaw.sort_dir as string) || undefined,
  })

  let query = supabase
    .from('v_patient__medications__active')
    .select('*', { count: 'exact' })

  const sortBy = sp.sort_by ?? 'created_at'
  const sortDir = sp.sort_dir ?? 'desc'
  query = query.order(sortBy, { ascending: sortDir === 'asc' })

  // Search across medication name and prescriber
  if (sp.search) {
    query = query.or(`medication_name.ilike.%${sp.search}%,prescriber.ilike.%${sp.search}%`)
  }

  // Filter by status
  if (sp.status) {
    query = query.eq('status', sp.status)
  }

  // Filter by route
  if (sp.route) {
    query = query.eq('route', sp.route)
  }

  // Pagination
  const from = (sp.page - 1) * sp.pageSize
  const to = from + sp.pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <ActiveMedicationsListFeature
        initialData={error ? [] : (data || [])}
        total={error ? 0 : (count || 0)}
        initialState={{
          page: sp.page,
          pageSize: sp.pageSize,
          ...(sp.search ? { search: sp.search } : {}),
          ...(sp.status ? { status: sp.status } : {}),
          ...(sp.route ? { route: sp.route } : {}),
          sort_by: sortBy,
          sort_dir: sortDir,
        }}
      />
    </ListPageLayout>
  )
}