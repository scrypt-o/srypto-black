# Job Card: Fix Naming Violations
Date: 2025-09-02
Status: Ongoing

## SUMMARY
Fix 8 critical naming violations causing app failures. Standardize all naming to prevent future breaks.

## THE PROBLEM
- 8 naming violations found across API/pages
- Inconsistent naming breaks vertical slices
- Example: profile save failed because API used "personal-info" instead of "persinfo"

## THE PLAN (30 minutes total)

### Phase 1: Fix API Folders (10 min)
```bash
mv app/api/patient/care-network app/api/patient/carenet
mv app/api/patient/medical-history app/api/patient/medhist  
mv app/api/patient/prescriptions app/api/patient/presc
rm -rf app/api/patient/settings  # Not in 11 groups
```

### Phase 2: Fix Page Routes (5 min)
```bash
mv app/patient/care-network app/patient/carenet
rm -rf app/patient/appointments  # Not in 11 groups
rm -rf app/patient/chat         # Not in 11 groups
rm -rf app/patient/routes       # Not in 11 groups
```

### Phase 3: Update All Imports (10 min)
- Search/replace all imports from old paths to new
- Update any hardcoded API calls
- Fix navigation configs

### Phase 4: Test & Verify (5 min)
- Run validation script
- Test one feature from each renamed group
- Commit with clear message

## EXPECTED OUTCOME
- 0 naming violations
- All features work with consistent paths
- Future failures prevented by validation script

## RISK
- Some imports might be missed
- Mitigation: Use grep to find all references before moving

## DECISION NEEDED FROM YOU
1. **Option A:** I fix all 8 violations now (30 min)
2. **Option B:** I fix just the critical ones (persinfo, medhist, presc) (15 min)
3. **Option C:** You want to review each change first

Just say "A", "B", or "C" - I'll execute immediately.

## Files to Create/Update
- ✓ ai/specs/core/CORE-NAMING-CONVENTION.md (created)
- ✓ scripts/validate-naming.sh (created)
- [ ] .git/hooks/pre-commit (pending)
- [ ] All affected imports (pending)

## Notes
The app has failed 30 times because of issues like this. One consistent naming convention will prevent most failures.