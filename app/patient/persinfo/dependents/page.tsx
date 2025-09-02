import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import ListPageLayout from '@/components/layouts/ListPageLayout'
import DependentsListFeature from '@/components/features/patient/persinfo/DependentsListFeature'

export const dynamic = 'force-dynamic'

export default async function DependentsListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await getServerClient()
  const spRaw = await searchParams

  const SortByEnum = z.enum(['created_at', 'full_name', 'relationship', 'date_of_birth'])
  const SortDirEnum = z.enum(['asc', 'desc'])
  const PageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    relationship: z.string().optional(),
    citizenship: z.string().optional(),
    sort_by: SortByEnum.optional(),
    sort_dir: SortDirEnum.optional(),
  })

  const sp = PageSchema.parse({
    page: (spRaw.page as string) ?? '1',
    pageSize: (spRaw.pageSize as string) ?? '20',
    search: (spRaw.search as string) || undefined,
    relationship: (spRaw.relationship as string) || undefined,
    citizenship: (spRaw.citizenship as string) || undefined,
    sort_by: (spRaw.sort_by as string) || undefined,
    sort_dir: (spRaw.sort_dir as string) || undefined,
  })

  let query = supabase
    .from('v_patient__persinfo__dependents')
    .select('*', { count: 'exact' })

  const sortBy = sp.sort_by ?? 'created_at'
  const sortDir = sp.sort_dir ?? 'desc'
  query = query.order(sortBy, { ascending: sortDir === 'asc' })

  if (sp.search) {
    query = query.or(`full_name.ilike.%${sp.search}%,first_name.ilike.%${sp.search}%,last_name.ilike.%${sp.search}%`)
  }
  if (sp.relationship) {
    query = query.eq('relationship', sp.relationship)
  }
  if (sp.citizenship) {
    query = query.eq('citizenship', sp.citizenship)
  }

  const from = (sp.page - 1) * sp.pageSize
  const to = from + sp.pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="Dependents">
      <DependentsListFeature
        initialData={error ? [] : (data || [])}
        total={error ? 0 : (count || 0)}
        initialState={{
          page: sp.page,
          pageSize: sp.pageSize,
          ...(sp.search ? { search: sp.search } : {}),
          ...(sp.relationship ? { relationship: sp.relationship } : {}),
          ...(sp.citizenship ? { citizenship: sp.citizenship } : {}),
          sort_by: sortBy,
          sort_dir: sortDir,
        }}
      />
    </ListPageLayout>
  )
}
