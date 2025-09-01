# Communications — Index

Date: 2025-08-31
Status: Spec Approved (v1 Non‑Realtime)
Scope: Patient app (messages/alerts/notifications/reminders)

Reading order
1. COMMUNICATIONS-SPEC.md — End-to-end functional + technical spec (this release)
2. (Optional) Future-REALTIME-NOTES.md — Notes for realtime and attachments (deferred)

Outputs to implement
- DB: `patient__comm__communications`, `patient__comm__links` + views `v_patient__comm__*`
- API: `/api/patient/comm/*` (CSRF + auth + Zod)
- Pages: `/patient/comm` hub + lists + compose + conversation
- TanStack: mutations (create message, link request/accept, mark read) + optional conversation query

