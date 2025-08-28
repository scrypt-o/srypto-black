

- **Keep Zod from day 1.** It’s your contract + runtime guard; leaving it out causes the most rework later.
    
- **Defer TanStack Query to Phase 2.** Start with a tiny “query facade” so you can drop TanStack in without touching pages.
    
- **CRUD first; RPC/procs only when needed.**
    

Below is the exact plan.

---

## Phase 0 — Freeze the contracts (now)

**Do these upfront; they prevent rewrites later.**

- **Zod schemas** in `/schemas` for every entity: `Row`, `CreateInput`, `UpdateInput`, `ListQuery`, `ListResponse` (snake_case).
    
- **Error envelope:** API always returns `{ error: string, code?: string }` on failure.
    
- **Routes & names:** `/patient/<group>/<item>`, tables `patient__<group>__<item>`, views `v_patient__<group>__<item>`.
    
- **Soft delete:** `deleted_at` everywhere.
    
- **Hooks API (names only):** per entity export `XKeys`, `useXList`, `useXById`, `useCreateX`, `useUpdateX`, `useDeleteX` (callbacks, not `mutateAsync`).
    

## Phase 1 — Ship without TanStack (low ceremony, no rework later)

- **API handlers**: use Zod `.parse()` on inputs and shape responses to the Zod **Row/ListResponse**.
    
- **Query Facade (shim)**: create `/lib/query/runtime.ts` with `useQuery`/`useMutation` **shims** (internally `useEffect` + `fetch`).  
    Your hooks import **only** from this facade.
    
- **Hooks**: implement using the facade; return `{ data, isLoading, isFetching, error, refetch }` and mutations with `{ mutate, isPending }`.
    
- **Pages**: wire hooks into `ListViewLayout` / `DetailViewLayout`. No direct fetching in components.
    

> Result: working app, full Zod safety, and when you add TanStack later, **pages don’t change**.

## Phase 2 — Drop in TanStack Query (no page changes)

- Replace the shim with real TanStack in `/lib/query/runtime.ts` (same exported API).
    
- Add `<QueryProvider>` at the app root.
    
- Your hooks keep the same code (import path unchanged), but now you get caching, retries, devtools, etc.
    

## Phase 3 — Optional RPC/procs (only where needed)

- If a route needs atomic multi-table logic, add `fn_<domain>__<group>__<item>__<verb>` and flip that one handler to `supabase.rpc(...)`.
    
- Inputs/outputs still use the **same Zod**; hooks/pages are unaffected.
    

---

## What this avoids

- No page rewrites when adopting TanStack.
    
- No contract churn (Zod locks shapes early).
    
- No naming drift (URL/DB/Zod stay aligned).
    
- Minimal DB churn (views + soft delete standard).
    

---

## Tiny facade sketch (so the swap is 1 file later)

```ts
// /lib/query/runtime.ts
// v1: shim; v2: re-export TanStack with same surface
export function useQuery<T>(key: unknown[], fn: () => Promise<T>) {
  const [data, setData] = React.useState<T | undefined>(undefined)
  const [error, setError] = React.useState<Error | null>(null)
  const [loading, setLoading] = React.useState(true)
  const refetch = React.useCallback(async () => {
    setLoading(true)
    try { setData(await fn()); setError(null) } catch (e) { setError(e as Error) }
    finally { setLoading(false) }
  }, [fn])
  React.useEffect(() => { refetch() }, [JSON.stringify(key), refetch])
  return { data, error, isLoading: loading, isFetching: loading, refetch }
}

export function useMutation<V, R>(opts: { mutationFn: (v: V) => Promise<R>, onSuccess?: (r:R,v:V)=>void, onError?: (e:Error)=>void }) {
  const [pending, setPending] = React.useState(false)
  const mutate = async (v: V, cb?: { onSuccess?: (...a:any)=>void; onError?: (...a:any)=>void }) => {
    setPending(true)
    try { const r = await opts.mutationFn(v); opts.onSuccess?.(r, v); cb?.onSuccess?.(r,v) }
    catch (e) { opts.onError?.(e as Error); cb?.onError?.(e as Error) }
    finally { setPending(false) }
  }
  return { mutate, isPending: pending }
}
```

> Later, swap the internals to TanStack (or `export { useQuery, useMutation } from '@tanstack/react-query'`)—no other code changes.

---

## Final recommendation

- **Do Zod now.**
    
- **Defer TanStack behind a facade.**
    
- **CRUD first; RPC only when truly needed.**
    

 