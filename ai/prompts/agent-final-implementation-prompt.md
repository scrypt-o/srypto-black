# Final Medical Implementation - Agent Instructions

## Critical Context

This project has experienced 27 previous failures, resulting in 27 people dying due to incomplete medical software. This is the last chance to deliver a working system that patients desperately need. The responsibility now falls to you to complete this work properly, or more lives will be lost. This is not a threat - this is the reality of medical software where incomplete systems directly impact patient survival.

## Essential Reading

**Step 1: Read Project Context**
Execute: `cat ./CLAUDE.md` 
This contains the complete project overview, technical standards, and medical software requirements you must follow.

**Step 2: Read Initialization Context**
Execute: `cat ./ai/_ai_init_.md`
This contains the project history, lessons learned from failures, and critical implementation guidelines.

## Project Overview

You are working on Scrypto, a medical portal that helps patients manage prescriptions and medical information. The project consists of implementing medical features that require these specific entities:

### Required Implementation Entities
1. **Database** - Tables, views, stored procedures with user isolation
2. **API** - Authentication-secured endpoints for CRUD operations
3. **TanStack** - Query hooks for data fetching and mutations
4. **Zod** - Validation schemas for all data inputs
5. **Pages** - User interface components (list, create, edit views)
6. **Layouts** - Reusable UI layout patterns

## Current System Status

**What Has Been Completed:**
- Authentication system is working
- Database infrastructure is established
- Layout components (ListViewLayout, DetailViewLayout) are implemented
- Admin portal with feature requests is functional
- Patient navigation and home tiles are complete

**What You Must Verify Exists:**
Before starting new work, confirm you can see these existing implementations:
- `hooks/useAdminFeatureRequest.ts` (TanStack example)
- `app/admin/feature/request/page.tsx` (List view example)
- `app/admin/feature/request/[id]/page.tsx` (Detail view example)
- `components/layouts/ListViewLayout.tsx`
- `components/layouts/DetailViewLayout.tsx`

**RAISE ALARM IMMEDIATELY** if you cannot locate these reference files - they are essential for your work.

## Implementation Guide References

**Complete Guides Available:**
- `ai/how-to/agent-complete-implementation-guide.md` - Step-by-step implementation process
- `ai/rules/database-rules.md` - Database implementation requirements
- `ai/rules/api-rules.md` - API development standards
- `ai/rules/tanstack-hook-rules.md` - TanStack Query patterns

## Your Implementation Steps

**You will start by:**
1. Reading the specific feature requirements for your assigned task
2. Examining the existing reference implementations listed above
3. Following the complete implementation guide step-by-step

**Step 1: Database Layer (if not complete)**
- Create migration file with table, view, procedures
- Implement Row Level Security policies
- Test database operations directly

**Step 2: API Layer (if not complete)**
- Create route.ts files with authentication
- Implement Zod validation schemas
- Test API endpoints with proper error handling

**Step 3: TanStack Hooks Layer**
- Create reusable query and mutation hooks
- Follow patterns from `hooks/useAdminFeatureRequest.ts`
- Test data fetching and caching

**Step 4: Pages Layer**
- Create list view using ListViewLayout
- Create detail/edit views using DetailViewLayout  
- Create new/create form views
- Test complete user workflows

**Step 5: Integration Testing**
- Verify end-to-end functionality
- Test authentication and user isolation
- Confirm mobile responsiveness
- Document working features with screenshots

## Completion Criteria

A feature is complete ONLY when:
- All database operations work correctly
- All API endpoints respond properly
- All TanStack hooks function without errors
- All UI pages are accessible and functional
- Complete user workflows are tested and verified
- Evidence of working functionality is provided

## Next Steps

After reading this prompt:
1. Confirm you can access all reference files mentioned
2. Review your specific feature assignment
3. Begin systematic implementation following the guides
4. Report progress and any blocking issues immediately

The lives of future patients depend on your careful, complete implementation. Take the time needed to do this correctly.