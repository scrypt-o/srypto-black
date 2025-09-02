import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import VitalSignsListFeature from '@/components/features/patient/vitality/VitalSignsListFeature'

export const dynamic = 'force-dynamic'

export default async function VitalSignsListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await getServerClient()
  const spRaw = await searchParams

  const SortByEnum = z.enum(['created_at', 'measurement_date', 'systolic_bp', 'heart_rate', 'temperature'])
  const SortDirEnum = z.enum(['asc', 'desc'])
  const PageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    measurement_context: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    sort_by: SortByEnum.optional(),
    sort_dir: SortDirEnum.optional(),
  })

  const sp = PageSchema.parse({
    page: (spRaw.page as string) ?? '1',
    pageSize: (spRaw.pageSize as string) ?? '20',
    search: (spRaw.search as string) || undefined,
    measurement_context: (spRaw.measurement_context as string) || undefined,
    date_from: (spRaw.date_from as string) || undefined,
    date_to: (spRaw.date_to as string) || undefined,
    sort_by: (spRaw.sort_by as string) || undefined,
    sort_dir: (spRaw.sort_dir as string) || undefined,
  })

  let query = supabase
    .from('v_patient__vitality__vital_signs')
    .select('*', { count: 'exact' })

  const sortBy = sp.sort_by ?? 'created_at'
  const sortDir = sp.sort_dir ?? 'desc'
  query = query.order(sortBy, { ascending: sortDir === 'asc' })

  if (sp.search) {
    query = query.or(`measurement_device.ilike.%${sp.search}%,measurement_context.ilike.%${sp.search}%,notes.ilike.%${sp.search}%`)
  }
  if (sp.measurement_context) {
    query = query.eq('measurement_context', sp.measurement_context)
  }
  if (sp.date_from) {
    query = query.gte('measurement_date', sp.date_from)
  }
  if (sp.date_to) {
    query = query.lte('measurement_date', sp.date_to)
  }

  const from = (sp.page - 1) * sp.pageSize
  const to = from + sp.pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Vital Signs">
      <VitalSignsListFeature
        initialData={error ? [] : (data || [])}
        total={error ? 0 : (count || 0)}
        initialState={{
          page: sp.page,
          pageSize: sp.pageSize,
          ...(sp.search ? { search: sp.search } : {}),
          ...(sp.measurement_context ? { measurement_context: sp.measurement_context } : {}),
          ...(sp.date_from ? { date_from: sp.date_from } : {}),
          ...(sp.date_to ? { date_to: sp.date_to } : {}),
          sort_by: sortBy,
          sort_dir: sortDir,
        }}
      />
    </ListPageLayout>
  )
}
