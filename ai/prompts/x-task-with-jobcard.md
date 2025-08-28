# Create JobCard Prompt
**Medical Development Workflow System**

If instruction is to rectify or continue, DO NOT CREATE NEW JOBCARD. Simply find the relevant open JOBCARD. 

## RULES

1. Every command must go through this pipeline: **SPEC → PLAN → JOBCARD → EXECUTE → TEST → COMPLETE**.

2. **SPEC**
   - Search specs/ for an applicable spec using @ routing:
     ```
     @ database    → ai/specs/development/database-implementation-spec.md
     @ api         → ai/specs/development/api-implementation-spec.md  
     @ layout      → ai/specs/development/layout-component-spec.md
     @ folder      → ai/specs/development/folder-organization-spec.md
     @ validation  → ai/specs/development/validation-implementation-spec.md
     @ data        → ai/specs/development/data-fetching-spec.md
     @ admin       → ai/specs/admin/feature-request-spec.md
     @ patient     → ai/specs/patient/{feature}-spec.md
     @ pharmacy    → ai/specs/pharmacy/{feature}-spec.md
     ```
   - If none match and uncertainty is high → **STOP** and write a STOP card in ai/alerts/.
   - If task is significant and no spec exists → create a task-specific spec in specs/features/.
   - If no spec but low uncertainty → write brief inline spec in the JobCard.
   - A spec must always exist.

3. **PLAN**
   - Write 3–6 high-level steps.
   - Break steps into atomic file-scoped tasks with acceptance criteria.

4. **JOBCARD**
   - Create a markdown file ai/jobcards/{DATE}-{SLUG}.md with:
     - HEADER: command, spec used, status (working|done|failed)
     - PLAN: list of steps
     - TASKS: checkboxes with file, note, acceptance
     - PROGRESS: timestamped log of actions
     - STATUS: current task, file, next action
     - NOTES: issues/gotchas
     - TESTS: checklist (compile, existing tests, new tests, E2E)
     - EVIDENCE: path ai/tests/{SLUG}/ and screenshots
     - RESULTS: summary of test runs

5. **EXECUTE**
   - For each task, make change, update PROGRESS, update STATUS.

6. **TEST**
   - Run compile, unit tests, E2E.
   - Save screenshots in ai/tests/{SLUG}/.
   - Update RESULTS in JobCard.
   - If all pass: git add, commit, push.

7. **COMPLETE**
   - If all acceptance criteria met → set status=done and move JobCard to ai/jobcards/done/.
   - If blocked or failed → set status=failed and leave in ai/jobcards/.

8. **STOP CARD**
   - If no spec and uncertainty=high, write ai/alerts/{DATE}-{SLUG}-NEED_SPEC.md:
     - Command
     - Reason
     - Unblock questions (scope, entities, acceptance criteria, constraints)

## TEMPLATE: JOBCARD

```markdown
# Job Card: {Title}
<!-- filename: ai/jobcards/{DATE}-{SLUG}.md -->

## HEADER
**Command:** {cmd}
**Spec Used:** {spec}
**Status:** working

## BODY
### Plan
1. {step 1}
2. {step 2}
3. {step 3}

### Tasks
- [ ] Task 1: {desc}
      File(s): {files}
      Note: {note}
      Acceptance:
        - {criterion A}
        - {criterion B}

- [ ] Task 2: {…}

### Progress Log
[{TIME}] Started — initialized job card

### Current Status
**Working on:** {task}
**File:** {file}
**Next action:** {action}

### Notes/Issues
- {gotchas}

## FOOTER
### Test Requirements
- [ ] Compile
- [ ] Existing tests pass
- [ ] New unit tests
- [ ] E2E flows

### Evidence
Path: ai/tests/{SLUG}/
- [ ] desktop.png
- [ ] mobile.png
- [ ] tablet.png

### Test Results
- Summary: {results}
```

## TEMPLATE: STOP CARD

```markdown
# STOP Card: Need Spec
<!-- filename: ai/alerts/{DATE}-{SLUG}-NEED_SPEC.md -->

**Command:** {original_command}
**Date:** {DATE}
**Reason:** No applicable spec found, uncertainty too high to proceed

## Unblock Questions
1. **Scope:** What exactly needs to be built/changed?
2. **Entities:** What data structures/components are involved?
3. **Acceptance Criteria:** How do we know when it's done?
4. **Constraints:** Any technical/medical/regulatory limitations?
5. **Dependencies:** What other systems/components does this affect?

## Recommended Next Steps
1. Create spec in ai/specs/features/{feature}-spec.md
2. Define clear requirements and patterns
3. Re-run command with proper spec in place
```

Now please do the following job:

$ARGUMENTS

