# Core Specs - Single Source of Truth

**These are the ONLY specs that matter for building Scrypto streams.**

## Essential Build Order
1. **01-Authentication.md** - Middleware protection, CSRF, environment setup
2. **02-API-Patterns.md** - Status codes, error handling, request/response shapes  
3. **03-Database-Access.md** - Views vs tables, RLS, ownership enforcement
4. **04-Zod-Validation.md** - Schema patterns, input/output validation
5. **05-Layout-Components.md** - ListPageLayout, DetailPageLayout usage
6. **06-SSR-Architecture.md** - Server components, client islands, data flow
7. **07-Navigation-URL-State.md** - Routing, search params, state management

## Supporting Specs
- **database-ddl/** - Database schema definitions (reference only)
- **ALLERGIES-END-TO-END-AUDIT.md** - Working reference implementation

## Rules
- **NO DUPLICATION** - Each concept documented in ONE place only
- **NO CONTRADICTIONS** - Core specs are single source of truth
- **REFERENCES ONLY** - Other specs reference core specs, don't repeat them

## For 50+ Streams
Use allergies as working example, follow core specs exactly, reference DDL for schema.

**Everything else is deprecated or archived.**