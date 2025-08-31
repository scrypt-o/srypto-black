# Prescription Scanning — Patient Workflow (Phase 1)

Status: Active (submit-only implementation in this phase)
Scope: Patient app (doctor and pharmacy apps follow later)
Tone: Professional; user-facing copy must be clear and respectful.

## High-Level Flow
- Doctor issues prescription (paper or electronic; paper covered here).
- Patient: Patient → Prescriptions → Scan Prescription.
- Capture: Take photo or upload image; confirm clarity.
- Analyze: Send image + AI prompt (from `ai_setup`) to AI.
- Result:
  - Not a prescription / unclear: Not an error. Show clear reason and allow retry.
  - Parsed prescription: Show structured details; patient can Save or Submit.
- Save: Persist structured result as a draft record.
- Submit: Change script status to submitted (pharmacy workflow begins later).
- View: Drafts/submitted items appear in prescriptions list/detail; patient cannot edit contents.

## States (script-level unless noted)
- scanned-ai-submitted: Image sent for analysis.
- ai-analysed-success: Parsed successfully (ready to Save/Submit).
- ai-analysed-no-success: Not a prescription or unclear; show AI reason; allow retake.
- ai-error: Technical failure during OCR/AI; allow retry.
- discarded: Patient abandons.
- ai-analysed-saved: Draft saved by patient (no pharmacy flow yet).
- ai-analysed-submitted: Patient submitted for pharmacy bidding (Phase 2 continues from here).

(Downstream, for future phases)
- submitted-allocated → allocated-accepted/allocated-discarded → accepted-validated → validated-quoted/validated-rejected → quoted-received → quoted-accepted (others close) → accepted-paid → paid-dispensed → dispensed-delivered → delivered-original-received.

## UX Rules
- “Not a prescription / unclear” is not an error state; treat as readable feedback with retry option.
- Show the AI’s reason string verbatim in a safe, respectful message (sanitize/format, no profanity in UI copy).
- Only present prescription fields to the patient (no editable fields).
- After Save: status = ai-analysed-saved.
- After Submit: status = ai-analysed-submitted.

## API Endpoints
- POST `/api/patient/prescriptions/analyze`
  - CSRF + auth; Zod input: `{ imageBase64, fileName, fileType }`.
  - Returns `{ success, isPrescription, data?, reason?, sessionId, uploadedPath, cost }`.
- POST `/api/patient/prescriptions/prescriptions` (this phase)
  - CSRF + auth; Zod input: `{ analysis, uploadedPath, sessionId }`.
  - Writes to `patient__presc__prescriptions` with `user_id`, `status='ai-analysed-saved'`, `analysis_data`, `image_path`.
  - Returns created row (id).
- POST `/api/patient/prescriptions/prescriptions/[id]/submit` (this phase)
  - CSRF + auth; Zod input: `{}`.
  - Updates row (owned by user) to `status='ai-analysed-submitted'`.

## Pages
- `/patient/presc/scan` (client): camera or upload; confirm; analyze; show results; Save/Submit.
- `/patient/presc/active` (server): list from `v_patient__presc__prescriptions` (drafts & submitted).

## Data Model (minimum viable)
- Table: `patient__presc__prescriptions`
  - `prescription_id uuid pk`
  - `user_id uuid`
  - `status text` (enum-like string; values above)
  - `image_path text`
  - `ai_session_id text`
  - `analysis_data jsonb` (structured payload from AI)
  - `created_at timestamptz`, `updated_at timestamptz`
- View: `v_patient__presc__prescriptions` (RLS-filtered by user).

## Testing
- API unit: analyze 422/200; save 422/201; submit 401/403/200; ownership enforced.
- E2E: upload → analyze (stub) → Save → Submit → appears in `/patient/presc/active`.

