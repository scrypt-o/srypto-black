# Prescription Analyze — MVP Server Pattern (Simple, Safe, Today)

## Goal
- Enable device camera capture on the client, but run ALL AI work on the server.
- Keep keys and business logic on the server. No secrets in the browser.
- Ship today with a minimal, boring, best‑practice flow that senior Next.js reviewers endorse.

## Architecture (SSR‑First + API)
- Client: capture image → POST to API
  - Route: `POST /api/patient/presc/analyze`
  - Body (JSON): `{ imageBase64: data-url, fileName: string, fileType: 'image/jpeg'|'image/png' }`
- Server (Route Handler): validates + authenticates + calls AI
  - CSRF check via `verifyCsrf(request)`
  - Session via `getServerClient().auth.getUser()` (401 if missing)
  - Zod validation for body
  - Enforce limits: max image size (e.g., 6MB), fileType whitelist
  - Call `ModernPrescriptionAIService.analyzePrescription()`
  - Store image in Supabase Storage (server role) and write `ai_audit_log`
  - Return structured JSON (no secrets)

## AI Service (Server‑Only)
- Reads config from DB view `v_ai_setup` (user‑scoped) or falls back to server env `OPENAI_API_KEY`
- Uses `@ai-sdk/openai` on the server only; never import AI SDKs in client code
- Extracts typed object (Zod) with: isPrescription, doctor/patient, issueDate, medications[], confidence
- Non‑prescription handling (mandatory): If the image is not a medical prescription, the service must return `isPrescription=false` and MUST NOT include any additional content or descriptions. API responds with a neutral refusal message only.

## Security
- No AI/API keys in client; no client‑side AI calls
- CSRF required for non‑GET; session required for all analysis
- Storage bucket private (RLS); access images via signed URLs only
- Audit log rows contain metadata only (no API keys, no PHI beyond what user sent)

## Rate & Cost Controls (MVP)
- Per‑user token bucket (e.g., 10/minute) — reject with 429 if exceeded
- Soft daily cap (e.g., 100/day) — log and block if exceeded

## Implementation Checklist
- API: `app/api/patient/presc/analyze/route.ts` (already present)
- Service: `lib/services/prescription-ai.service.ts` (server‑only imports)
- View: create `v_ai_setup` (user‑scoped) to read configs safely from SSR
- Storage: confirm `prescription-images` is private; serve via signed URL
- Add image size check (6MB) + MIME sniff
- Add simple per‑user rate limiter (in‑memory + userId key; upgrade later)

## Testing (Today)
- Unit: route parses/validates body, 401/403/422/429/200 paths
- E2E (Playwright): login → scan page → upload → see structured JSON

## Future (Not Blocking MVP)
- Retry/backoff for transient AI errors
- Queue long‑running analysis (if OCR grows)
- Admin dashboard from `ai_audit_log`
