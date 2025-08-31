# Session Summary + YOLO/MCP Setup (2025-08-31)

## TL;DR
- Implemented prescription scanning save/submit flow + list page; fixed sidebar + Personal Information pages (Profile, Medical Aid, Addresses hub + Home/Postal/Delivery, Documents); added QA reports, screenshots, and pipe-dynamic columns for your renderer.
- Added tests for API analyze and an E2E upload path (stubbed AI). Created reports under `ai/reports` and screenshots under `ai/testing/screenshots`.
- Wrote a comms v1 spec (non‑realtime), SSR-first, with simple links + communications tables and TanStack mutation hooks.

## Key Paths
- Reports: `ai/reports/20250831-patient-status.md` (+ `.columns.txt`), with fixed‑width summary in chat.
- QA JSON: `ai/testing/20250831-dashboard-status.json`.
- Screenshots: `ai/testing/screenshots/20250831-*.png`.
- Specs (comms): `ai/specs/communications/README.md`, `ai/specs/communications/COMMUNICATIONS-SPEC.md`.

## App Changes (highlights)
- Prescriptions:
  - Analyze API: `/api/patient/prescriptions/analyze` (CSRF+auth+Zod); Save: `/api/patient/prescriptions/prescriptions`; Submit: `/api/patient/prescriptions/prescriptions/[id]/submit`.
  - UI: `/patient/presc/scan` (camera+upload), `/patient/presc/active` (list). Sidebar updated.
- Personal Information:
  - Sidebar wired; corrected labels. Added SSR pages: `/patient/persinfo/profile`, `/medical-aid`, `/addresses` hub, `/addresses/home|postal|delivery`, `/documents`.
- Addresses:
  - One record per type (home/postal/delivery). Postal page supports map (shows link/embed depending on `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).

## Testing Added
- Jest API: `__tests__/api/prescriptions.analyze.test.ts` (422 + 200, AI mocked).
- Playwright E2E: `tests/e2e/prescription-scan-upload.spec.ts` (upload → analyze stub → results).
- Prior CRUD/API suites across 8 streams, plus smoke pages tests (200).

## YOLO/MCP – How to run me with MCP servers
Use this prompt to configure and verify MCP (Playwright + Supabase). Replace paths as needed.

```
Configure MCP servers (YOLO mode):
- Register servers:
  mcpServers:
    - name: "playwright"
      command: "node"
      args: ["./path/to/playwright-mcp/server.js"]
      env:
        BASE_URL: "https://qa.scrypto.online"
        OUTPUT_DIR: "./ai/testing/screenshots"
    - name: "supabase"
      command: "node"
      args: ["./path/to/supabase-mcp/server.js"]
      env:
        SUPABASE_URL: "https://<project>.supabase.co"
        SUPABASE_ANON_KEY: "<anon>"
        SUPABASE_SERVICE_ROLE_KEY: "<service-role>" # only if needed
        DEFAULT_SCHEMA: "public"
        ALLOWLIST: "v_patient__*,patient__*"

Then restart the client and run:
- List tools: "List MCP tools and report availability"
- Sanity tests:
  - Playwright MCP: open qa.scrypto.online, screenshot home → save under ai/testing/screenshots.
  - Supabase MCP: select 1 row from v_patient__medhist__allergies (limit 1) scoped to my session.
Return the outputs and any errors.
```

## Sandbox/Mode – Quick self-diagnose prompt
Use this once to have me report runtime modes:

```
Diagnose runtime:
- Print current sandbox mode, network, and approval policy.
- Attempt: create temp file in repo root and delete it; report success.
- Attempt: HTTPS GET https://qa.scrypto.online/ (HEAD ok) and report status.
- Echo detected cwd and node version.
```

## Next Steps
- If you want, I can generate a ready `mcp.config.json` under `ai/tools/` with these blocks, plus a short README tailored to your client (Claude Desktop / VS Code Claude / custom CLI).
