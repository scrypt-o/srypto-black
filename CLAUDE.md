# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server**
- `npm run dev` - Start development server with port management (port 4569)
- `npm run dev:pm2` - Start via PM2 for stability
- `npm run dev:stop` - Stop PM2 dev server
- `npm run dev:restart` - Restart PM2 dev server
- `npm run dev:logs` - View PM2 logs
- `npm run dev:status` - Check PM2 status

**Build & Deployment**
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run start:4569` - Start on specific port

**Code Quality**
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript type checking
- `npm run check` - Both typecheck and lint
- Always run these after code changes

**Testing**
- `npm test` - Jest unit tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests
- `npm run test:api` - API tests
- `npm run test:e2e` - Playwright e2e tests
- `npm run test:e2e:ui` - Playwright with UI
- `npm run test:medical` - Medical/critical path tests
- `npm run test:coverage` - With coverage report

## Architecture Overview

**Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Supabase, TanStack Query

**Key Patterns**:
- **SSR-first**: Server pages fetch data, client components are presentational
- **Vertical slices**: Database → API → Hooks → Pages → Tests
- **Feature-based architecture**: `components/features/` organized by domain/group/item

### Project Structure

```
app/                          # Next.js App Router pages
├── patient/                  # Patient portal (Phase 1)
│   ├── [group]/[item]/      # Dynamic routes (e.g., medhist/allergies)
│   └── layout.tsx           # Patient-specific layout
├── pharmacy/                # Pharmacy portal (planned)
├── api/                     # API routes
│   ├── patient/             # Patient API endpoints
│   └── auth/                # Authentication endpoints
└── globals.css              # Global styles

components/
├── features/                # Domain-specific features
│   ├── patient/             # Patient features by group
│   ├── prescriptions/       # Prescription scanning
│   └── pharmacy/            # Pharmacy features
├── layouts/                 # Layout components
│   ├── *PageLayout.tsx      # Server layouts
│   ├── *ViewLayout.tsx      # Client view components
│   └── *Sidebar.tsx         # Sidebar components
├── patterns/                # Reusable patterns
├── ui/                      # Base UI components
└── providers/               # Context providers

lib/
├── supabase-*.ts           # Supabase client configs
├── services/               # Business logic services
├── stores/                 # State management (Zustand)
├── utils/                  # Utility functions
└── security/               # Security utilities (CSP, etc.)

ai/specs/                   # Technical specifications
├── core/                   # Core architecture specs
├── prescription-scanning/  # Prescription scanning specs
└── [feature]/              # Feature-specific specs
```

### Naming Conventions

**URL Structure**: `/patient/<group>/<item>`
- Domain: `patient` (Phase 1)
- Groups: `comm`, `persinfo`, `presc`, `medications`, `location`, `deals`, `vitality`, `carenet`, `medhist`, `labresults`, `rewards`
- Items: kebab-case slugs (e.g., `family-history`)

**Database**:
- Tables: `patient__<group>__<item>`
- Views: `v_patient__<group>__<item>`
- RPCs: `fn_<domain>__<group>__<item>__<verb>`

**Code**:
- Zod schemas: PascalCase (e.g., `AllergyRowSchema`)
- Database fields: snake_case
- Components: PascalCase with descriptive suffixes (`AllergiesListFeature`)

### Authentication & Security

- **Route Protection**: Middleware handles auth for `/patient/*` routes
- **API Security**: Non-GET endpoints require CSRF verification and authentication
- **Data Access**: Server pages read from RLS-protected views (`v_*`)
- **File Uploads**: Supabase Storage with signed URLs and RLS

### Layout System

**Server Layouts** (use in pages):
- `ListPageLayout` - For list/index pages
- `DetailPageLayout` - For detail/edit pages  
- `TilePageLayout` - For dashboard/hub pages

**Client View Components**:
- `ListViewLayout` - Handles search, filters, pagination
- `DetailViewLayout` - Handles forms, sections, action bars
- `TileGridLayout` - Grid layout for tiles/cards

### API Patterns

**CRUD Endpoints**:
- `GET/POST /api/patient/<group>/<item>`
- `GET/PUT/DELETE /api/patient/<group>/<item>/[id]`

**Standard Query Parameters**:
- `?page&pageSize&search&sort_by&sort_dir` (all list endpoints)

**Error Format**: `{ error: string, code?: string }`

**Required Security Checks**:
```typescript
// Non-GET handlers must include:
const csrf = verifyCsrf(request)
if (csrf) return csrf

const { supabase, user } = await getAuthenticatedApiClient()
```

### Data Flow

1. **Server pages** fetch initial data from views (`v_*`)
2. **Client components** use TanStack Query hooks for mutations
3. **Hooks pattern**: `useXList`, `useXById`, `useCreateX`, `useUpdateX`, `useDeleteX`
4. **State management**: Local state + TanStack Query cache, Zustand for global state

## Development Workflow

**Before Making Changes**:
1. Check for existing specifications in `ai/specs/`
2. Follow the naming conventions above
3. Use appropriate layout components

**After Making Changes**:
1. Run `npm run check` (lint + typecheck)
2. Run relevant tests
3. Test browser functionality using browser-tool (not MCP Playwright)

## Testing & Browser Automation

**Browser Testing**: Use custom browser-tool (188x faster than MCP):
- `./browser-tool/screen-grab http://localhost:4569/page`
- `./browser-tool/screen-grab http://localhost:4569/page --mobile`
- `./browser-tool/screen-grab http://localhost:4569/page --fullpage`
- Screenshots saved to `docs/testing/screen-grabs/`

## Git Configuration

- `git push newrepo` (not `git push` due to remote configuration)
- Remote: https://github.com/scrypt-o/srypto-black.git

## Key Dependencies

- **UI**: Radix UI, Tailwind CSS, Lucide React icons
- **Data**: Supabase (database, auth, storage), TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Maps**: Google Maps API integration
- **AI**: OpenAI integration for prescription scanning
- **Testing**: Jest, Playwright, Testing Library

## Important Notes

- Always use specifications from `ai/specs/` - never work without a spec
- Server components fetch data, client components handle interactions
- All database operations use RLS-enabled views for security
- Follow the single H1 rule - view layouts own page titles
- Use established patterns for consistency across the codebase