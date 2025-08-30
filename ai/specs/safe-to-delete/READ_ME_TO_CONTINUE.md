# READ ME TO CONTINUE — Final Next.js Conversion Prompt (2025)

Purpose
- This is the single prompt to rehydrate AI context and drive the final, textbook Next.js implementation. Use it when context is low or after handoffs. The goal: a clean, senior-approved, server‑first Next.js app with Allergies as the golden reference.

How We Build (North Star)
- Server‑first pages and shells; client islands for interactivity only.
- Read data server‑side via Supabase server client (views for reads); mutations can remain API routes.
- URL is source of truth for list state; store hydrates from URL.
- Navigation uses `<Link prefetch>`; imperative `router.prefetch()` inside islands only.
- Accessibility and correctness over cleverness; production build hygiene.

What Exists (today)
- Golden example in progress: Allergies (server shells, client islands, improved API semantics).
- Specs: SSR + CRUD + API error semantics are documented across specs.
- Job cards: SSR conversion and remediation cards are in place.

Copy/Paste This Prompt (run this first)

```
You are the senior Next.js (2025) engineer taking over Scrypto.
Your task: Finish the final conversion to a textbook, server‑first app with Allergies as the canonical example. Move decisively; rewrite when needed.

Context loading order (read in full, then proceed):
1) ai/init.md
2) ai/specs/READ_ME_TO_CONTINUE.md  (this file)
3) ai/specs/Critical-enhancement-required.md
4) ai/specs/Pattern - Complete CRUD Implementation.md
5) ai/specs/Pattern - API and Fetch Helpers.md
6) ai/jobcards/28082025-allergies-textbook-implementation-job-card.md
7) ai/jobcards/28082025-allergies-ssr-conversion-job-card.md
8) ai/jobcards/28082025-final-allergies-audit-job-card.md

Non‑negotiables (apply everywhere):
- Pages and layout shells are server components; interactivity lives in small client islands.
- Server reads via Supabase server client using views `v_*`; mutations keep existing API routes (unless a server action is clearly superior and safe).
- URL drives list state (page/search/filters/sort); hydrate client store from URL.
- Navigation uses <Link prefetch>; use router.prefetch() only in client islands.
- Error semantics: 422 for validation (include details); 400 for malformed JSON; 401/403 auth/perm; 404 not found; 500 unexpected.
- Inputs: trim server‑side; map empty strings → undefined for optional fields.
- Accessibility: labeled inputs, aria-sort on sorted headers, discoverable filter badge changes, clear loading/not-found.
- Production hygiene: next build + next start (PM2) with compression; avoid page‑level 'use client'.

Your mandate (do this, in order):
1) Allergies pages to SSR
   - Convert `app/patient/medhist/allergies/page.tsx`, `[id]/page.tsx`, `new/page.tsx` to server components.
   - Server‑fetch via Supabase server client (`getServerClient`) from `v_patient__medhist__allergies` with `searchParams`.
   - Render server shells; mount existing client islands (list/detail/form) with initial data/state.
   - Replace row/title taps and “Add” with `<Link prefetch>` where possible.

2) Shells server‑by‑default
   - Keep `ListPageLayout` and `DetailPageLayout` as server components that compose tiny client chrome and islands.
   - Sidebar/Header: compute active route server‑side (pass `currentPath`); keep collapse/drawer + sign‑out as tiny client bits or server actions if safe.

3) List state + URL
   - Ensure Allergies uses a single store for page/search/filters/sort, hydrated from URL; keep URL sync debounced.
- Ensure the client feature takes initial data from the server page to avoid double fetch at first paint.

4) Prefetch and navigation polish
   - Add `<Link prefetch>` for list → detail and “Add New” routes; use `router.prefetch()` only inside client islands when imperative.

5) A11y & UX
   - Add `aria-sort` to sortable headers; verify labels on inputs; ensure error/not-found states are readable.

6) Performance sanity
   - Remove any remaining page‑level 'use client'.
   - Keep shells server‑rendered; only mount client islands where needed.

7) Audit + Document
   - Walk through `ai/jobcards/28082025-final-allergies-audit-job-card.md` and check each box.
   - Add a short `README.md` under `app/patient/medhist/allergies/` summarizing the pattern (server‑first, islands, URL state, prefetch).

Allowed scope (move fast, be decisive):
- You may rewrite files in place.
- You may remove or replace client‑only anti‑patterns (page‑level 'use client', window.location.href, client fetch for first paint).
- Prefer keeping Zod (SSOT + 422), but if Zod blocks velocity at runtime boundaries, refactor the boundary and keep types exact. Do not degrade error semantics.
- Do not add new packages unless absolutely required; no package.json script changes.

Success criteria:
- A senior Next.js dev says: “Server‑first pages/shells + client islands, URL‑driven list state, SSR reads via Supabase — yes, that’s correct.”
- Allergies navigates in <800ms on QA build; no hydration warnings; clean console.
- APIs unchanged for mutations; reads are server‑rendered; error semantics remain correct.
- Accessibility basics met (labels, aria-sort, discoverable changes).

Deliverables:
- Code edits in the Allergies module and shells per the plan.
- README in `app/patient/medhist/allergies/` explaining the pattern.
- Completed audit job card checkboxes.
```

Notes
- If DB indexes are needed for scale (user_id, is_active, created_at desc; pg_trgm for ilike), log them as a separate DB hardening job. Do not block SSR conversion on DB changes.
- Keep using job cards for transparency; mark status and list changed files.
