import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import PageShell from '@/components/layouts/PageShell'
import SurgeriesListFeature from '@/components/features/patient/surgeries/SurgeriesListFeature'

export const dynamic = 'force-dynamic'

export default async function SurgeriesListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await getServerClient()
  const spRaw = await searchParams

  const SortByEnum = z.enum(['created_at', 'surgery_name', 'surgery_date', 'surgery_type', 'outcome'])
  const SortDirEnum = z.enum(['asc', 'desc'])
  const PageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    surgery_type: z.string().optional(),
    outcome: z.string().optional(),
    sort_by: SortByEnum.optional(),
    sort_dir: SortDirEnum.optional(),
  })

  const sp = PageSchema.parse({
    page: (spRaw.page as string) ?? '1',
    pageSize: (spRaw.pageSize as string) ?? '20',
    search: (spRaw.search as string) || undefined,
    surgery_type: (spRaw.surgery_type as string) || undefined,
    outcome: (spRaw.outcome as string) || undefined,
    sort_by: (spRaw.sort_by as string) || undefined,
    sort_dir: (spRaw.sort_dir as string) || undefined,
  })

  let query = supabase
    .from('v_patient__medhist__surgeries')
    .select('*', { count: 'exact' })

  const sortBy = sp.sort_by ?? 'surgery_date'
  const sortDir = sp.sort_dir ?? 'desc'
  query = query.order(sortBy, { ascending: sortDir === 'asc' })

  if (sp.search) {
    query = query.or(`surgery_name.ilike.%${sp.search}%,surgeon_name.ilike.%${sp.search}%,hospital_name.ilike.%${sp.search}%`)
  }
  if (sp.surgery_type) {
    query = query.eq('surgery_type', sp.surgery_type)
  }
  if (sp.outcome) {
    query = query.eq('outcome', sp.outcome)
  }

  const from = (sp.page - 1) * sp.pageSize
  const to = from + sp.pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Scrypto">
      <SurgeriesListFeature
        initialData={error ? [] : (data || [])}
        total={error ? 0 : (count || 0)}
        initialState={{
          page: sp.page,
          pageSize: sp.pageSize,
          ...(sp.search ? { search: sp.search } : {}),
          ...(sp.surgery_type ? { surgery_type: sp.surgery_type } : {}),
          ...(sp.outcome ? { outcome: sp.outcome } : {}),
          sort_by: sortBy,
          sort_dir: sortDir,
        }}
      />
    </PageShell>
  )
}
