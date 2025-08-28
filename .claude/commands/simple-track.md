# SIMPLE TRACKING COMMAND

When starting any task, create ONE tracking file:

## File Location:
`ai/proof/current-work.md`

## Format:
```markdown
Task: [What you're implementing]
Started: [ISO timestamp]
Plan: [Which plan step from ai/plan/]

## Progress:
- [ ] Step 1 name
- [ ] Step 2 name
- [ ] Step 3 name

## Files Created:
- [list as you create them]

## Status:
[Working/Complete/Blocked]
```

## When Complete:
1. Move to: `ai/proof/completed/[date]-[feature].md`
2. Add screenshots if UI
3. That's it

## Example:
```markdown
Task: Allergies CRUD Implementation
Started: 2025-08-25T19:00:00Z
Plan: Step 1 from ALLERGIES-IMPLEMENTATION-PLAN.md

## Progress:
- [x] Created Zod schemas
- [x] Created facade
- [ ] Created API routes
- [ ] Created hooks
- [ ] Created pages

## Files Created:
- /schemas/allergies.ts
- /lib/query/runtime.ts

## Status:
Working - on step 3
```

NO COMPLEX LOGIC. Just one file showing what you're doing.