# PARALLEL AGENTS PROMPT - AFTER ALLERGIES WORKS

**ONLY USE THIS AFTER ALLERGIES IS 100% COMPLETE**

---

## THE MASTER PROMPT (For Launching 4 Parallel Agents)

```markdown
I have a working Allergies implementation that needs to be replicated EXACTLY for 4 other entities.

The working implementation is at:
- Schemas: /schemas/allergies.ts
- API: /app/api/patient/medical-history/allergies/
- Hooks: /hooks/usePatientAllergies.ts
- Pages: /app/patient/medhist/allergies/

You will implement the SAME PATTERN for your assigned entity.
NO CREATIVITY. NO OPTIMIZATION. JUST COPY AND REPLACE.

## CRITICAL: Soft Delete Method
Use `is_active = false` for soft delete
All tables use `is_active` boolean field

## Agent 1: Implement Conditions
Entity: Conditions
Table: patient__medhist__conditions
View: v_patient__medhist__conditions
Primary Key: condition_id
Main Field: condition_name
DDL: ai/specs/database-ddl/patient__medhist__conditions_ddl.md

Replace:
- "allergy" → "condition" (lowercase)
- "Allergy" → "Condition" (Pascal)
- "allergies" → "conditions" (plural)
- "allergen" → "condition_name" (main field)
- Field mappings from DDL

## Agent 2: Implement Immunizations
Entity: Immunizations
Table: patient__medhist__immunizations
View: v_patient__medhist__immunizations
Primary Key: immunization_id
Main Field: vaccine_name
DDL: ai/specs/database-ddl/patient__medhist__immunizations_ddl.md

Replace:
- "allergy" → "immunization"
- "Allergy" → "Immunization"
- "allergies" → "immunizations"
- "allergen" → "vaccine_name"
- Field mappings from DDL

## Agent 3: Implement Family History
Entity: Family History
Table: patient__medhist__family_hist
View: v_patient__medhist__family_hist
Primary Key: family_history_id
Main Field: condition
DDL: ai/specs/database-ddl/patient__medhist__family_hist_ddl.md

Replace:
- "allergy" → "familyHistory"
- "Allergy" → "FamilyHistory"
- "allergies" → "family-history" (URL)
- "allergies" → "familyHistory" (code)
- "allergen" → "condition"
- Field mappings from DDL

## Agent 4: Implement Surgeries
Entity: Surgeries
Table: patient__medhist__surgeries
View: v_patient__medhist__surgeries
Primary Key: surgery_id
Main Field: surgery_name
DDL: ai/specs/database-ddl/patient__medhist__surgeries_ddl.md

Replace:
- "allergy" → "surgery"
- "Allergy" → "Surgery"
- "allergies" → "surgeries"
- "allergen" → "surgery_name"
- Field mappings from DDL

## EACH AGENT MUST:

1. Create schemas file at /schemas/[entity].ts
2. Create API routes at /app/api/patient/medical-history/[entity]/
3. Create hooks at /hooks/usePatient[Entity].ts
4. Create pages at /app/patient/medhist/[entity]/
5. Test with exact same Playwright steps as allergies
6. Document any deviations in /ai/plan/[entity]-implementation-notes.md

## SUCCESS CRITERIA:
- TypeScript compiles without errors
- All CRUD operations work
- Same UI/UX as allergies
- Passes Playwright tests
```

---

## INDIVIDUAL AGENT CHECKLIST TEMPLATE

Each agent creates this file: `/ai/plan/[entity]-checklist.md`

```markdown
# [ENTITY] Implementation Checklist

## Files Created:
- [ ] /schemas/[entity].ts
- [ ] /app/api/patient/medical-history/[entity]/route.ts
- [ ] /app/api/patient/medical-history/[entity]/[id]/route.ts
- [ ] /hooks/usePatient[Entity].ts
- [ ] /app/patient/medhist/[entity]/page.tsx
- [ ] /app/patient/medhist/[entity]/new/page.tsx
- [ ] /app/patient/medhist/[entity]/[id]/page.tsx

## Functionality:
- [ ] List displays records
- [ ] Create adds new record
- [ ] Edit updates record
- [ ] Delete soft-deletes record
- [ ] User scoping enforced

## Testing:
- [ ] Screenshots captured
- [ ] Mobile responsive
- [ ] No console errors
- [ ] TypeScript compiles

## Deviations from Allergies:
[List any differences here]
```

---

## SONNET-SPECIFIC INSTRUCTIONS

When using Claude Sonnet for agents:

1. **Give each agent ONE entity only** - Sonnet performs better with single focus
2. **Include the working allergies code** in the prompt as reference
3. **Explicitly state "NO CREATIVITY"** - Sonnet tends to optimize
4. **Require exact file paths** - Sonnet sometimes creates files in wrong locations
5. **Test each agent's work individually** before combining

---

## VERIFICATION PROMPT (After All Agents Complete)

```markdown
Verify all 4 medical history implementations:

1. Run TypeScript check - must have zero errors
2. Test each entity's CRUD operations
3. Verify database queries are user-scoped
4. Check mobile responsiveness
5. Document in /ai/plan/verification-report.md

Report format:
- Conditions: ✅ or ❌ (with issues)
- Immunizations: ✅ or ❌ (with issues)
- Family History: ✅ or ❌ (with issues)
- Surgeries: ✅ or ❌ (with issues)

If any fail, fix before proceeding.
```

---

## CRITICAL RULES FOR AGENTS

1. **NEVER SKIP THE FACADE** - Always use /lib/query/runtime, never import TanStack directly
2. **NEVER CHANGE PATTERNS** - Copy allergies exactly, only change names/fields
3. **NEVER ADD FEATURES** - No search, no filters, no sorting - just basic CRUD
4. **NEVER OPTIMIZE** - Working is better than clever
5. **ALWAYS TEST** - Each agent must test their own implementation

---

## IF AN AGENT FAILS

1. Document exactly what failed
2. Compare with working allergies implementation
3. Fix only the deviation
4. Re-test
5. Document fix in /ai/plan/[entity]-fixes.md

Remember: These agents are copying a working pattern. If it fails, they deviated from the pattern.