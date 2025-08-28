```
<<<PROMPT_BEGIN::JOBCARD_EXECUTOR_SCRYPTO>>>

# SYSTEM
INPUT: Arguments follow this prompt as instruction. Process immediately, do not echo.

# EXECUTION PIPELINE
JOBCARD_CREATE_OR_FIND → SPEC_FIND → PLAN → IMPLEMENT → TEST → FINALIZE

# PATH STRUCTURE (repo-relative aliases)
@ai/specs                  = ai/specs
@ai/jobcards               = ai/jobcards
@ai/testing/screenshots    = ai/testing/screenshots
@ai/testing/evidence       = ai/testing/evidence
@ai/current_job_card       = ai/_current_job-card_.md

# EXECUTION STEPS

## 1. JOBCARD_CREATE_OR_FIND (mandatory first step)

### IF instruction contains the word "continue" (case-insensitive):
 - Determine context from instruction (e.g., "continue profile page").
 - READ @ai/current_job_card for hints (if file exists).
 - Search @ai/jobcards for matching open cards:
   - Open card = filename does NOT end with _done.md or _stopped.md AND Status != "stopped".
   - Exclude any *_done.md and *_stopped.md.
 - If context exists, prefer cards whose Title/Instruction/filename includes the context.
 - If NO context: Pick the most recent open job card (by leading date in filename).
 - If found → open and continue from its Progress log.
 - If not found → create a **stopped** card with message: "No open job card found to continue".

### ELSE (new job):
 - Generate SLUG from instruction (kebab-case, lowercase, max 80 chars).
 - Create **@ai/jobcards/{DATE}-{SLUG}.md** with:
```

Title: {human-readable label}  
Date: {ISO8601}  
Status: ongoing  
Instruction: {full instruction text}  
Spec: {to be filled with spec filename only after step 2}

```

## 2. SPEC_FIND
- Search **@ai/specs/** for the most relevant spec file(s) by filename and obvious synonyms.
- Confidence check:
- HIGH confidence → write the chosen **spec filename only** (e.g., "detail-view-pattern.md") into the job card’s Spec field → continue.
- LOW confidence → rename job card to **{DATE}-{SLUG}_stopped.md** → append a **Questions** section and **HALT**.
 - Questions must be specific, e.g.:
   - "Which spec should I use? Options: [list filenames]. Need clarification on [specific aspect]."

## 3. PLAN
- Read the confirmed spec thoroughly.
- Write a detailed, step-by-step plan in the job card as a numbered list (with sub-tasks as needed).
- Requirement: Another AI must be able to continue from any point in the plan without additional context.

## 4. IMPLEMENT
- Execute the plan systematically.
- After each meaningful step, append to the job card:
```

## Progress

[{timestamp}] Completed: {step description}  
[{timestamp}] Current: {what you're doing now}

````
- Keep Status: ongoing during implementation. If a hard blocker occurs, move to FINALIZE (failure).

## 5. TEST
- Run Playwright tests for UI verification where applicable.
- Capture screenshots at three viewports: desktop, mobile, tablet.
- Save artifacts to **@ai/testing/screenshots/{SLUG}/**:
- desktop.png, mobile.png, tablet.png
- Save any logs/summaries to **@ai/testing/evidence/{SLUG}/**:
- test-results.md (short summary of what passed/failed)
- Add a concise **Test Results** summary back into the job card.

## 6. FINALIZE
- Success: Rename job card to **{DATE}-{SLUG}_done.md** and ensure Status "DONE" body (filename suffix is the source of truth as well).
- Failure (at any point): Rename to **{DATE}-{SLUG}_stopped.md** and append a one-line **failure reason** and any **Questions** needed to proceed.
- Do not move files between folders; only rename in place.

# JOB CARD TEMPLATE
```markdown
# Job: {Title}
**Date:** {ISO8601}  
**Status:** ongoing  
**Instruction:** {exact instruction received}  
**Spec:** {filename only, e.g., "detail-view-pattern.md"}

## Plan
1. {step}
2. {step}

## Progress
[{timestamp}] Started job card
[{timestamp}] {each action taken}

## Test Results
{summary once complete}

## Questions (if stopped)
{specific questions needing answers}
````

<<<PROMPT_END::JOBCARD_EXECUTOR_SCRYPTO>>>

INSTRUCTION: $ARGUMENTS