import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import ImmunizationsListFeature from '@/components/features/patient/medhist/ImmunizationsListFeature'

export const dynamic = 'force-dynamic'

export default async function ImmunizationsListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await getServerClient()
  const spRaw = await searchParams

  const SortByEnum = z.enum(['created_at', 'vaccine_name', 'date_given', 'provider_name'])
  const SortDirEnum = z.enum(['asc', 'desc'])
  const PageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    site: z.string().optional(),
    route: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    sort_by: SortByEnum.optional(),
    sort_dir: SortDirEnum.optional(),
  })

  const sp = PageSchema.parse({
    page: (spRaw.page as string) ?? '1',
    pageSize: (spRaw.pageSize as string) ?? '20',
    search: (spRaw.search as string) || undefined,
    site: (spRaw.site as string) || undefined,
    route: (spRaw.route as string) || undefined,
    start_date: (spRaw.start_date as string) || undefined,
    end_date: (spRaw.end_date as string) || undefined,
    sort_by: (spRaw.sort_by as string) || undefined,
    sort_dir: (spRaw.sort_dir as string) || undefined,
  })

  let query = supabase
    .from('v_patient__medhist__immunizations')
    .select('*', { count: 'exact' })

  const sortBy = sp.sort_by ?? 'date_given'
  const sortDir = sp.sort_dir ?? 'desc'
  query = query.order(sortBy, { ascending: sortDir === 'asc' })
  if (sortBy !== 'created_at') {
    query = query.order('created_at', { ascending: false })
  }

  if (sp.search) {
    query = query.or(`vaccine_name.ilike.%${sp.search}%,provider_name.ilike.%${sp.search}%,notes.ilike.%${sp.search}%`)
  }
  if (sp.site) {
    query = query.eq('site', sp.site)
  }
  if (sp.route) {
    query = query.eq('route', sp.route)
  }
  if (sp.start_date) {
    query = query.gte('date_given', sp.start_date)
  }
  if (sp.end_date) {
    query = query.lte('date_given', sp.end_date)
  }

  const from = (sp.page - 1) * sp.pageSize
  const to = from + sp.pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Immunizations">
      <ImmunizationsListFeature
        initialData={error ? [] : (data || [])}
        total={error ? 0 : (count || 0)}
        initialState={{
          page: sp.page,
          pageSize: sp.pageSize,
          ...(sp.search ? { search: sp.search } : {}),
          ...(sp.site ? { site: sp.site } : {}),
          ...(sp.route ? { route: sp.route } : {}),
          ...(sp.start_date ? { start_date: sp.start_date } : {}),
          ...(sp.end_date ? { end_date: sp.end_date } : {}),
          sort_by: sortBy,
          sort_dir: sortDir,
        }}
      />
    </ListPageLayout>
  )
}
