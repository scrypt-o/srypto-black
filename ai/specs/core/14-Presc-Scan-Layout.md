# PrescScanPageLayout — Spec

## Purpose
Unique layout for prescription scanning with step header and patient chrome.

## Composition
- Server shell: `PrescScanPageLayout` (SSR) → `PrescScanPageLayoutClient`.
- Chrome: PatientSidebar, AppHeader, MobileFooter, ChatDock.
- Sticky step header below AppHeader showing: 1. Capture → 2. Analyze → 3. Review (and Error when applicable).
- Content: step content fills the viewport below the sticky header.

## Integration
- Page: `/patient/presc/scan` now uses `PrescScanPageLayout` and renders a client `ScanOrchestrator`.
- Steps implemented by existing features: CameraCaptureFeature, PrescriptionAnalysisFeature, PrescriptionResultsFeature.

## A11y & UX
- Keyboard focus maintained across steps; clear error screen with retry/cancel.
- Keep interactions within the content area; header only shows navigation/back behavior.

## Migration
- Completed switch of `/patient/presc/scan` from client page to server wrapper + client island orchestration.

