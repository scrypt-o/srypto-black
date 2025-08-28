# Prompt: Generate Complete Specification for Scrypto Medical Portal Feature

## Initial Context
**FIRST**: Read `/_eve_/projects/scrypto/code-base/_docs/ai-context-strict.md` to understand the project, rules, and medical software requirements.

## Your Task
You need to create a complete specification for a feature in the Scrypto medical portal. Every item (page/feature) MUST have a spec before implementation - this is required by stakeholders for medical compliance.

## Background
Scrypto is a medical portal where specifications are legally required documentation. Each spec must cover:
1. Database design (tables, views, procedures)
2. API endpoints (routes, validation, security)
3. Frontend components (UI, forms, validation)
4. TanStack Query hooks (data fetching, caching)

## High-Level Rules
1. **Naming Convention**: Always use `{domain}__{group}__{item}` pattern
2. **Database Access**: Views for reads, procedures for writes, NEVER direct table access
3. **Security**: User isolation via `auth.uid()`, RLS policies mandatory
4. **Validation**: Zod schemas for all inputs, medical-grade validation
5. **Testing**: Every spec must define test criteria

## Process to Follow

### Step 1: Create Job Card
Create a job card in `ai/jobcards/` with this format:
```markdown
# Job Card: Spec Generation - [Domain]__[Group]__[Item]

**Date**: [Today's date]
**Status**: Active
**Type**: Specification Generation
**Feature**: [domain]__[group]__[item]

## Tasks
- [ ] Review existing patterns
- [ ] Review how-to guides
- [ ] Create database spec
- [ ] Create API spec
- [ ] Create frontend spec
- [ ] Create TanStack spec
- [ ] Combine into complete spec
- [ ] Verify against standards
```

### Step 2: Review Documentation
Read these documents in order:
1. **Patterns** (`ai/patterns/`):
   - `generic-list-view-page-pattern (v2).md` - For list pages
   - `generic-detail-view-page-pattern.md` - For detail/form pages
   - `generic-file-upload-pattern.md` - If uploads needed

2. **How-To Guides** (`ai/instructions/`):
   - `how-to-database-operations.md` - Database layer
   - `how-to-api-routes.md` - API implementation
   - `how-to-tanstack-hooks.md` - Data fetching
   - `how-to-zod-validation.md` - Input validation

3. **Rules** (`ai/rules/`):
   - Review any domain-specific rules

### Step 3: Create the Specification

Create **ONE COMBINED SPEC** file in `ai/specs/[domain]/[group]/`:

**File name**: `[domain]__[group]__[item]-complete-spec.md`

**Structure**:
```markdown
# Complete Specification: [Domain]__[Group]__[Item]

## Overview
- **Purpose**: [What this feature does]
- **Users**: [Who uses this]
- **Medical Criticality**: [High/Medium/Low]

## Database Specification

### Table Structure
```sql
CREATE TABLE [domain]__[group]__[item] (
  -- Define all fields with types and constraints
);
```

### View Definition
```sql
CREATE VIEW v_[domain]__[group]__[item] AS
SELECT * FROM [domain]__[group]__[item]
WHERE user_id = auth.uid() AND is_active = true;
```

### Stored Procedures
```sql
-- Create procedure
CREATE FUNCTION sp_[domain]__[group]__[item]_create(...)

-- Update procedure  
CREATE FUNCTION sp_[domain]__[group]__[item]_update(...)

-- Delete procedure
CREATE FUNCTION sp_[domain]__[group]__[item]_delete(...)
```

### RLS Policies
```sql
CREATE POLICY "Users see own data only"...
```

## API Specification

### Endpoints
- `GET /api/[domain]/[group]/[item]` - List all records
- `POST /api/[domain]/[group]/[item]` - Create new record
- `PUT /api/[domain]/[group]/[item]` - Update record
- `DELETE /api/[domain]/[group]/[item]` - Delete record

### Validation Schema (Zod)
```typescript
const [Item]Schema = z.object({
  // All fields with validation rules
});
```

### Response Format
```typescript
// Success response
{
  data: [Item] | [Item][]
}

// Error response
{
  error: string,
  details?: ZodError[]
}
```

## Frontend Specification

### Page Type
- [ ] List View (table with search/filter)
- [ ] Detail View (form for single record)
- [ ] Both (list + add/edit)

### Route
`/[domain]/[group]/[item]`

### Components
1. **Main Page**: `app/[domain]/[group]/[item]/page.tsx`
2. **Form Component**: `components/[domain]/[group]/[Item]Form.tsx`
3. **List Component**: `components/[domain]/[group]/[Item]List.tsx`

### Form Fields
| Field Name | Type | Required | Validation |
|------------|------|----------|------------|
| field_1    | text | Yes      | Min 1 char |
| field_2    | select | Yes   | From enum  |
| ...        | ...  | ...      | ...        |

## TanStack Query Specification

### Hooks Required
```typescript
// List hook
export function use[Item]List() {
  return useQuery({
    queryKey: ['[domain]', '[group]', '[item]', 'list'],
    queryFn: fetch[Item]List
  });
}

// Create mutation
export function use[Item]Create() {
  return useMutation({
    mutationFn: create[Item],
    onSuccess: () => queryClient.invalidateQueries(['[domain]', '[group]', '[item]'])
  });
}

// Update mutation
export function use[Item]Update() {
  return useMutation({
    mutationFn: update[Item],
    onSuccess: () => queryClient.invalidateQueries(['[domain]', '[group]', '[item]'])
  });
}

// Delete mutation
export function use[Item]Delete() {
  return useMutation({
    mutationFn: delete[Item],
    onSuccess: () => queryClient.invalidateQueries(['[domain]', '[group]', '[item]'])
  });
}
```

## Mobile Considerations
- Touch targets minimum 44px
- Form layout single column on mobile
- Responsive table (horizontal scroll or card view)

## Security Requirements
- [x] Authentication required
- [x] User can only access own data
- [x] Audit logging for all changes
- [x] Input sanitization
- [x] No sensitive data in logs

## Test Criteria
1. **Database**: Procedures work correctly
2. **API**: CRUD operations return correct status codes
3. **Frontend**: Page loads, form saves, validation works
4. **Security**: User isolation verified
5. **Mobile**: Works on 390x844 viewport

## Implementation Order
1. Database migration
2. API routes
3. TanStack hooks
4. Frontend components
5. Testing

## Acceptance Criteria
- [ ] All CRUD operations functional
- [ ] Validation prevents invalid data
- [ ] User can only see own data
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] No console.logs
- [ ] Tests passing
```

### Step 4: Close Job Card
Update the job card:
- Mark all tasks as completed
- Change status to `completed`
- Add completion date
- Move to `ai/jobcards/submitted/`

## Decision: Combined vs Separate Specs

**USE COMBINED SPEC** - Single file with all layers because:
1. Easier to review complete feature
2. Ensures consistency across layers
3. Reduces file sprawl
4. Single source of truth

## Example Domains/Groups/Items

**Patient Domain**:
- `patient__persinfo__profile` - Personal profile
- `patient__persinfo__emergency_contacts` - Emergency contacts
- `patient__medications__active` - Active medications
- `patient__medhist__allergies` - Allergies
- `patient__presc__prescriptions` - Prescriptions

**Admin Domain**:
- `admin__feature__request` - Feature requests
- `admin__users__management` - User management
- `admin__audit__logs` - Audit logs

## Validation Checklist
Before marking spec complete, verify:
- [ ] Follows naming convention exactly
- [ ] Database has view and procedures
- [ ] API uses procedures only
- [ ] Frontend has form validation
- [ ] TanStack hooks defined
- [ ] Security requirements met
- [ ] Test criteria clear
- [ ] Mobile considerations included

## Important Notes
1. **Medical Compliance**: Every field that stores medical data needs validation
2. **User Isolation**: Every query must filter by user_id
3. **Audit Trail**: Every table needs created_at, updated_at
4. **Soft Delete**: Use is_active flag, never hard delete
5. **Required Fields**: First name, last name always required for patient data

## Your Output
1. Create job card first
2. Create complete spec following template above
3. Close job card when done
4. Confirm: "Spec created for [domain]__[group]__[item]"

**Start by asking**: "Which feature needs a specification? Please provide domain, group, and item name."