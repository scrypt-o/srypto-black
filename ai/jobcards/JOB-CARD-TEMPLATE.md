# JOB CARD - [FEATURE/TASK NAME]
Date: [YYYY-MM-DD]
Status: [IN_PROGRESS | COMPLETED | BLOCKED | CANCELLED]
Duration: [Estimated/Actual time]
Priority: [HIGH | MEDIUM | LOW]

## EXECUTIVE SUMMARY
[1-2 sentence summary of what this job card accomplishes]

## INITIAL STATE
[Describe the current state, problems, or requirements that triggered this work]
- **Problem 1**: [Description]
- **Problem 2**: [Description]
- **Missing Feature**: [Description]

## OBJECTIVES
[What we're trying to achieve]
1. **Primary Goal**: [Main objective]
2. **Secondary Goals**: [Supporting objectives]
3. **Success Criteria**: [How we'll know we succeeded]

## TECHNICAL APPROACH

### Architecture Decisions
- **Pattern Used**: [SSR-first, vertical slice, etc.]
- **Components**: [Layout types, feature components]
- **Data Flow**: [Server pages → hooks → mutations]

### Database Changes
- **Tables**: [New/modified tables]
- **Views**: [New/modified views]
- **RPCs**: [New/modified functions]

### API Design
- **Endpoints**: [List new API routes]
- **Security**: [CSRF, auth requirements]
- **Validation**: [Zod schemas]

## IMPLEMENTATION PLAN

### Phase 1: Foundation
- [ ] Create/update specifications
- [ ] Database schema changes
- [ ] Core API endpoints

### Phase 2: Features
- [ ] Server page components
- [ ] Client components with hooks
- [ ] Form validation and submission

### Phase 3: Integration
- [ ] Layout integration
- [ ] Navigation updates
- [ ] Error handling

### Phase 4: Testing & Polish
- [ ] Unit tests
- [ ] Integration tests
- [ ] Browser testing with screenshots
- [ ] Code quality checks (npm run check)

## FILES TO BE CREATED/MODIFIED

### New Files
- `[path/to/new/file.ts]` - [Purpose]
- `[path/to/another/file.tsx]` - [Purpose]

### Modified Files
- `[path/to/existing/file.ts]` - [What changes]
- `[path/to/another/file.tsx]` - [What changes]

## DEPENDENCIES
- **Specs Required**: [List specs that must exist first]
- **Other Tasks**: [Dependencies on other job cards]
- **External APIs**: [Third-party integrations needed]

## TESTING STRATEGY

### Unit Tests
- [ ] [Component/function to test]
- [ ] [Another component/function to test]

### Integration Tests
- [ ] [API endpoint to test]
- [ ] [Database operations to test]

### Browser Tests
- [ ] Desktop screenshots: [URLs to test]
- [ ] Mobile screenshots: [URLs to test]
- [ ] User flow: [Step-by-step testing]

## RISKS & MITIGATION
- **Risk 1**: [Description] → **Mitigation**: [How to handle]
- **Risk 2**: [Description] → **Mitigation**: [How to handle]

## SUCCESS METRICS
- **Functionality**: [What should work]
- **Performance**: [Speed/efficiency targets]
- **Code Quality**: [Lint/typecheck passing]
- **User Experience**: [UI/UX goals]

## COMPLETION CHECKLIST

### Code Quality
- [ ] `npm run check` passes (lint + typecheck)
- [ ] All tests pass
- [ ] No console errors
- [ ] Code follows naming conventions

### Documentation
- [ ] Specs updated if needed
- [ ] Comments added for complex logic
- [ ] API documentation updated
- [ ] This job card completed

### Testing Evidence
- [ ] Desktop screenshots saved
- [ ] Mobile screenshots saved
- [ ] Test credentials work (t@t.com / t12345)
- [ ] Error cases handled

### Integration
- [ ] Navigation updated
- [ ] Permissions/auth working
- [ ] RLS policies correct
- [ ] No breaking changes

## LESSONS LEARNED
[To be filled after completion]
- **What Worked Well**: [Successful approaches]
- **What Was Challenging**: [Difficult parts]
- **What Would You Do Differently**: [Improvements for next time]

## POST-COMPLETION TASKS
[Follow-up work that might be needed]
- [ ] [Future enhancement]
- [ ] [Related feature]
- [ ] [Performance optimization]

---

**Created by**: [Your name/Claude Code]
**Estimated Duration**: [Time estimate]
**Actual Duration**: [Actual time taken]
**Confidence Level**: [% confident in completion]

## NOTES
[Any additional notes, links to specs, related issues, etc.]

---

### TEMPLATE USAGE INSTRUCTIONS

1. **Copy this template** for each new major task
2. **Fill in all bracketed sections** before starting work
3. **Update status and checkboxes** as you progress
4. **Save screenshots** to `docs/testing/screen-grabs/`
5. **Complete lessons learned** section after finishing
6. **Follow naming convention**: `YYYY-MM-DD-brief-description.md`

### EXAMPLE NAMING
- `2025-09-03-patient-appointments-crud.md`
- `2025-09-03-pharmacy-quote-system.md`
- `2025-09-03-prescription-scanning-fixes.md`