import { z } from 'zod'
import { requireUser, getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ClientListPageChrome from '@/components/layouts/ClientListPageChrome'
import AllergiesListIsland from '@/components/features/patient/allergies/AllergiesListIsland'

export const dynamic = 'force-dynamic'

export default async function AllergiesListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser()
  const supabase = await getServerClient()
  const spRaw = await searchParams

  const SortByEnum = z.enum(['created_at', 'allergen', 'severity', 'allergen_type'])
  const SortDirEnum = z.enum(['asc', 'desc'])
  const PageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    allergen_type: z.string().optional(),
    severity: z.string().optional(),
    sort_by: SortByEnum.optional(),
    sort_dir: SortDirEnum.optional(),
  })

  const sp = PageSchema.parse({
    page: (spRaw.page as string) ?? '1',
    pageSize: (spRaw.pageSize as string) ?? '20',
    search: (spRaw.search as string) || undefined,
    allergen_type: (spRaw.allergen_type as string) || undefined,
    severity: (spRaw.severity as string) || undefined,
    sort_by: (spRaw.sort_by as string) || undefined,
    sort_dir: (spRaw.sort_dir as string) || undefined,
  })

  let query = supabase
    .from('v_patient__medhist__allergies')
    .select('*', { count: 'exact' })

  const sortBy = sp.sort_by ?? 'created_at'
  const sortDir = sp.sort_dir ?? 'desc'
  query = query.order(sortBy, { ascending: sortDir === 'asc' })

  if (sp.search) {
    query = query.or(`allergen.ilike.%${sp.search}%,reaction.ilike.%${sp.search}%`)
  }
  if (sp.allergen_type) {
    query = query.eq('allergen_type', sp.allergen_type)
  }
  if (sp.severity) {
    query = query.eq('severity', sp.severity)
  }

  const from = (sp.page - 1) * sp.pageSize
  const to = from + sp.pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return (
    <ClientListPageChrome sidebarItems={patientNavItems} headerTitle="Allergies">
      <AllergiesListIsland
        initialData={error ? [] : (data || [])}
        total={error ? 0 : (count || 0)}
        initialState={{
          page: sp.page,
          pageSize: sp.pageSize,
          ...(sp.search ? { search: sp.search } : {}),
          ...(sp.allergen_type ? { allergen_type: sp.allergen_type } : {}),
          ...(sp.severity ? { severity: sp.severity } : {}),
          sort_by: sortBy,
          sort_dir: sortDir,
        }}
      />
    </ClientListPageChrome>
  )
}
