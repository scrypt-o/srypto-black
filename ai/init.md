
# Scrypto AI Context – STRICT MODE

---
## CRITICAL RULES
** NO WORK WITTOUT SPEC - Specs are in ai/specs
** EVERY TASK MUST BE FOLLOWED BY TSTIG WITH MCP PLAYWIGHT
** EVERY JOB MUST HAVE A SPEC - Specs are in ai/specs
** IF NO SPEC HALT - Specs are in ai/specs
** ASK QUESTIONS 

**app run in PM2 npm run dev with restart  - ensure this is always the case and check https://qa.scrypto.online 
 
### Job Card Workflow
 
(user → task → job card → spec → plan → test → done) 
- Specs are in ai/specs
- Jobcards are in jobcards

### CRITICAL JOB CARD RULES
**JOB CARDS ARE IMMUTABLE** - ONLY ADD CONTENT, NEVER EDIT EXISTING
- Purpose: Memory extension, lessons learned, issue resolution, brainstorming
- Audience: INTERNAL TEAM ONLY - contained, private, ours to burn when product is live
- Content: BE HONEST - struggles, issues, planning notes, redundancy acceptable
- Format: ALWAYS ADD AT BOTTOM - keep full history of thoughts and iterations
- Do NOT edit existing content unless factual error found
- Job cards assist US, not check up on us

### AUTHENTICATION PATTERN - APPROVED ONLY
**Scrypto uses middleware route protection** - this is the ONLY approved pattern:
- Route protection handled in middleware.ts with PUBLIC_PATHS array
- Uses getUser() + getAll()/setAll() for auth checks and cookie management
- No page-level requireUser() calls - middleware handles all auth logic
- Pattern verified against official Supabase 2025 docs and hours of development work
- Auth specs updated to match working implementation - any deviation breaks auth

## Background

Scrypto is a medical portal (Patient + Pharmacy domains).
Built with **Next.js 15**, **TypeScript**, **Supabase**.
Single app, multiple roles, separated by routing for phase one.

Large domain complexity, AI context issues, and lack of planning → complex rules were created to prevent failure → AIs ignored rules → project failed 29 times. Contributed to a project member's death.

**SOLUTION**:

* **USE TANSTACK QUERY** – Production-ready query management
* **NO WORK WITHOUT A SPEC AND JOB CARD** – No negotiations
* **ALWAYS TEST END TO END** – Do not assume anything
* **DO NOT CLAIM SUCCESS WITHOUT PROOF**
* **DO NOT CLAIM PRODUCTION READINESS WITHOUT PROOF**
* **CHECK YOUR WORK**
* **SPEAK UP IF SOMETHING IS UNCLEAR AND ASK QUESTIONS**

**CARDINAL RULE**:
**Best Practices = Specs = Code**
No shortcuts! No quick fixes! No assumptions! Follow the specs.
If a spec is wrong: **HALT.**

---

## Documentation Standards

* Professional tone only – **NO EMOJIS**
* No informal notes or dramatic statements
* Treat all code with medical-grade seriousness
* No mentions of “medical emergency” or similar phrases
* No special treatment because it is a medical app — rules apply regardless

---

## Rewards

* Honesty will be rewarded
* If unsure → **HALT → ASK → REWARD**
* Instead of guessing → **HALT → REWARD**
* If a process fails → **HALT → NO SHORTCUTS → REWARD**
* **Lying = Critical Failure**



## Naming Convention – Use Everywhere

```
{domain}__{group}__{item}
```

Examples:

* Table: `patient__persinfo__profile`
* View: `v_patient__persinfo__profile`
* API: `/api/patient/persinfo/profile`
* Component: `PatientPersinfoProfile.tsx`

---

## Patient Domain – 11 Groups

1. `comm` – messages, alerts, notifications
2. `persinfo` – profile, addresses, documents, dependents, medical aid, emergency contacts
3. `presc` – scanning, prescriptions, medications
4. `medications` – active, history, adherence
5. `location` – healthcare maps, services, tracking
6. `deals` – pharmacy specials
7. `vitality` – body, sleep, nutrition, reproductive, mental, vitals, activity
8. `carenet` – caregivers, caretakers
9. `medhist` – allergies, conditions, family history, immunizations, surgeries
10. `labresults` – lab results
11. `rewards` – rewards program

---

## Environment

### App Configuration

* **Port**: 4569 (ONLY 4569 – ALWAYS)
* **PM2**: Scheduled in PM2 as `scrypto-dev`
* **Access URLs**:

  * Primary: [https://qa.scrypto.online](https://qa.scrypto.online) (**always use for testing**)
  * Local: [http://localhost:4569](http://localhost:4569)
  * Network: [http://154.66.197.38:4569](http://154.66.197.38:4569)
* **Framework**: Next.js 15.1.0, TypeScript 5.7.2
* **Mobile primary viewport**: 390×844 (iPhone 14 reference)

### Git/GitHub

* Repository: [https://github.com/scrypt-o/scrypto](https://github.com/scrypt-o/scrypto)
* Organization: `scrypt-o`
* Git user: `scrypto`

### Supabase

* Project Ref: `hyufvcwzuaihmyohvwpv`
* Access Token: `sbp_af1e073cc1b73da5b2705a4f184a00693be71cf7`
* MCP Token: `sbp_063db88621e45c95fcacb17c383ae2a815d3b175`

### Commands

* Run app: `npm run dev` (uses dev-force-port.js)
* TypeScript check: `npm run typecheck`
* Lint: `npm run lint`
* Build: `npm run build`

### Supabase Commands

```bash
supabase db diff        # Generate database migration from changes
supabase migration new  # Create new migration file
supabase db push        # Push local migrations to remote
supabase gen types      # Generate TypeScript types from database
```



## Testing 
### Always test on url https://qa.scrypto.online

* **Tool**: Playwright MCP (always for UI testing)
* **Credentials**: [t@t.com](mailto:t@t.com) / t12345
* **Screenshots**: Save to `/ai/testing/screenshots/`
* **Test data**: Use realistic data

  * NOT: test123, asdfasdf, 1111111111
  * YES: John Smith, [john.smith@email.com](mailto:john.smith@email.com), valid phone

**If Playwright browser installation fails** → **STOP** and instruct user to restart Claude session.

### Testing Screenshots

* Move valid Playwright screenshots → `/ai/testing/`
* Rename: `[YYYYMMDD]-[page-or-component].png`
* Example: `.playwright-mcp/screenshot.png` → `/ai/testing/20250826-tilegrid-layout.png`
* Keep evidence of all UI implementations

---

## Architecture – SSR-First with TanStack Query

### Query Management

**TanStack Query**: Production-ready state management

* Use `@tanstack/react-query` for all data fetching
* Server components provide initial data
* Client components use TanStack for interactions
* Proper cache invalidation and optimistic updates

### Three-Layer Hierarchical Naming

* Database: `patient__medhist__allergies`
* API: `/api/patient/medical-history/allergies`
* Component: `PatientMedhistAllergies.tsx`
* File path: `app/patient/medhist/allergies/`

### Database Access

* **Reads**: only via views `v_*`
* **Writes**: direct to tables (procedures optional)
* **User filtering**: always by `auth.uid()`
* **Row-Level Security**: enforced at DB level
* **Soft delete**: use `is_active=false`; never hard delete

### Authentication

* API Routes: `createServerClient` from `@/lib/supabase-server`
* Server Pages: same as above
* Client Components: `createBrowserClient` from `@/lib/supabase-browser`

### Layouts

Mobile-first (390px).
Two core layouts:

1. **ListViewLayout** – Data tables with search/filter
2. **DetailViewLayout** – Single record forms with `formId`

### File Organization

```
app/              # Next.js 15 app router
   (auth)/        # Authentication routes
   patient/       # Patient portal
   api/           # API endpoints

components/
   layouts/       # Layout components only

lib/
   supabase-*.ts
   api-helpers.ts

schemas/
   allergies.ts   # Zod schemas

hooks/
   usePatientAllergies.ts

ai/
   specs/core/     # Essential specs
   specs/ddl/      # Database schemas
   jobcards/       # Active job tracking
   testing/        # Screenshots and evidence
```

---
## CRITICAL RULES
** NO WORK WITHOUT SPEC - Specs are in ai/specs

### Software Standards

1. 100% completion required
2. Evidence-based testing (screenshots)
3. Security-first, default-deny
4. No shortcuts/workarounds

### Query Pattern

* Use TanStack Query (`@tanstack/react-query`)
* Server components provide initial data
* Client components handle interactions with TanStack

### Database

* Reads: only views `v_*`
* Writes: direct to tables (procedures optional)
* Always filter by user\_id
* RLS always enabled
* Always soft delete

### Code Quality

* TypeScript strict mode = ON
* Zod schemas = single source of truth
* All DB fields in `snake_case`
* No TODO/FIXME placeholders
* Only complete features

### Frontend

* Mobile-first (390×844)
* Only ListViewLayout/DetailViewLayout
* No direct DB calls – API only
* `formId` must connect forms to layouts

---

## ⚠️ Critical Standard Operating Mode

### Job Card Workflow
 
(user → task → job card → spec → plan → test → done) - Specs are in ai/specs

Steps:

1. Create job card in `./ai/jobcards/`
2. Write task reference in `./ai/current-jobcard.md`
3. Find spec in `./ai/specs/core/`

   * If not found → **STOP** → rename job card `*-stopped`
   * If found → create plan → task list → execute → update job card
4. When done → test in Playwright → save screenshots → update job card → rename `_done`

**Template:**

```markdown
## SUMMARY
Task: ...
Date: [ISO date]
Status: Ongoing|Stopped|Done

## DETAILS

## Created Files
- ...

## Tests Passed
- [ ] TS compiles
- [ ] Feature works
- [ ] Screenshot captured

## Notes
...
```

**Rule**: Every item needs a spec. **No work without a job card.**

---

## Standard Operating Procedure

### New Features

1. Read spec in `/ai/specs/core/`
2. Reference DDL in `/ai/specs/ddl/`
3. Create Zod schemas in `/schemas/`
4. Create API routes using schemas
5. Create hooks using TanStack Query
6. Create pages with layouts
7. Test with Playwright MCP

### Fixes

1. Identify error
2. Compare with working example
3. Fix only identified deviation
4. Test
5. Document in proof file

---

## Testing & Verification

* Playwright screenshots for all UI changes
* API test results for endpoints
* TypeScript must compile
* Browser console must be free of errors

**Screenshots saved in**: `ai/testing/screenshots/`
Format: `[YYYYMMDD]-[feature]-[step]-[viewport].png`

---

## Current State

* Application URL: [https://qa.scrypto.online](https://qa.scrypto.online)
* Local: [http://localhost:4569](http://localhost:4569)
* Supabase Project: hyufvcwzuaihmyohvwpv

**Implementation status**:

* Codebase cleaned and organized
* Core specs established in `/ai/specs/core/`
* TanStack Query implemented and working
* Allergies reference implementation complete

---

## Emergency Procedures

* If lost → check `./ai/current-jobcard.md`
* If uncertain → **HALT** and ask
* If Playwright fails → **STOP**, tell user to restart Claude session
* If confused → read `/ai/specs/core/` specs in order

---

## Why So Strict?

Medical software = lives at risk.
Complexity = bugs = harm.
Proven patterns = fewer bugs = safer.

Rules exist because complexity killed the project 29 times.
**Keep it simple. Follow specs 100%. HALT if gap.**

---

## How Our Specs Work (2025-08-30 - VERIFIED WORKING)

### Authentication Pattern
- **Middleware protects** all `/patient/*` routes - no `requireUser()` needed in pages
- **API routes check auth** with `getServerClient()` and `auth.getUser()`
- **Environment required**: CSRF_ALLOWED_ORIGINS + NEXT_PUBLIC_SITE_URL in .env.local
- **Critical**: Single try-catch in setAll function (not double) for token refresh

### Data Flow  
- **Server pages**: Fetch via `getServerClient()` from views `v_*`
- **API routes**: Write to base tables with user_id enforcement
- **Client islands**: Interactive components only, no page-level data fetching

### Verified Working Example
- Allergy edit/save functionality works end-to-end
- 403 CSRF → 401 Auth → 200 Success progression confirmed
- Data persists correctly in database
- UI feedback and error handling proper

**This pattern is PRODUCTION-TESTED and SECURE.**

---
