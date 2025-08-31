|col-display-name="Domain";col-stat-type="pie";col-stat-groupby="domain,group"|
|col-display-name="Sidebar Wired %";col-stat-type="percentage";col-stat-groupby="domain,group"|
|col-display-name="Routes Wired %";col-stat-type="percentage";col-stat-groupby="domain,group"|
|col-display-name="Page 200 %";col-stat-type="percentage";col-stat-groupby="domain,group"|
|col-display-name="API CRUD Coverage";col-stat-type="pie";col-stat-groupby="domain,group"|
|col-display-name="TanStack Usage";col-stat-type="pie";col-stat-groupby="domain,group"|
|col-display-name="Zod Coverage";col-stat-type="pie";col-stat-groupby="domain,group"|
|col-display-name="API Implementation";col-stat-type="pie";col-stat-groupby="domain,group"|
|col-display-name="DB/View Coverage";col-stat-type="pie";col-stat-groupby="domain,group"|
|col-display-name="Ready (MVP) %";col-stat-type="percentage";col-stat-groupby="domain,group"|
|col-display-name="Ready (Prod) %";col-stat-type="percentage";col-stat-groupby="domain,group"|
|col-display-name="Total Items";col-stat-type="count";col-stat-groupby="domain,group"|

# Patient App Status — 2025-08-31

Format is stable each run; columns are consistent for board intake. If unsure, status is marked as Not Tested for now.

Legend
- Route (href): Yes – Wired | Yes – Not Wired | No
- Sidebar: Yes – Wired | Yes – Not Wired | No
- Page 200: Yes | No | Not Tested
- API CRUD, TanStack, Zod, API Impl, DB: Yes – Testcases | Yes – Manual Tested | Yes – Not Tested | No | N/A
- Ready (MVP/Prod): Yes | Partial | No

| Domain | Group | Item | Label | Route (href) | Sidebar | Page 200 | API CRUD | TanStack | Zod | API Impl | DB | Page Layouts | Tech Debt | Ready MVP | Ready Prod |
|--------|-------|------|-------|--------------|---------|----------|----------|---------|------|---------|----|--------------|----------|-----------|------------|
| patient | personal-info | profile | Profile | Yes – Wired (/patient/persinfo/profile) | Yes – Wired | Not Tested | N/A | No | No | No | View exists | Detail (PageShell) | Needs schema + API if edits required | Yes | Partial |
| patient | personal-info | medical-aid | Medical Aid | Yes – Wired (/patient/persinfo/medical-aid) | Yes – Wired | Not Tested | N/A | No | No | No | View exists | Detail (PageShell) | Needs schema + API if edits required | Yes | Partial |
| patient | personal-info | addresses | Addresses (hub) | Yes – Wired (/patient/persinfo/addresses) | Yes – Wired | Not Tested | N/A | No | No | No | Views exist | TilePage + 3 Detail pages | Add Places search (optional), no edits | Yes | Partial |
| patient | personal-info | addresses/home | Home Address | Yes – Wired (/patient/persinfo/addresses/home) | Yes – Wired | Not Tested | N/A | No | No | No | View exists | Detail (map + fields) | Needs coordinates in view | Yes | Partial |
| patient | personal-info | addresses/postal | Postal Address | Yes – Wired (/patient/persinfo/addresses/postal) | Yes – Wired | Not Tested | N/A | No | No | No | View exists | Detail (map + fields) | Add Places search (optional) | Yes | Partial |
| patient | personal-info | addresses/delivery | Delivery Address | Yes – Wired (/patient/persinfo/addresses/delivery) | Yes – Wired | Not Tested | N/A | No | No | No | View exists | Detail (map + fields) | None | Yes | Partial |
| patient | personal-info | documents | Documents | Yes – Wired (/patient/persinfo/documents) | Yes – Wired | Not Tested | N/A | No | No | No | View exists | List (PageShell) | Needs upload flow later | Yes | Partial |
| patient | personal-info | emergency-contacts | Emergency Contacts | Yes – Wired (/patient/persinfo/emergency-contacts) | Yes – Wired | Yes | Yes – Testcases | Yes – Not Tested | Yes – Not Tested | Yes – Testcases | v_patient__persinfo__emrg_contacts | List (PageShell + client feature) | None | Yes | Partial |
| patient | personal-info | dependents | Dependents | Yes – Wired (/patient/persinfo/dependents) | Yes – Wired | Yes | Yes – Testcases | Yes – Not Tested | Yes – Not Tested | Yes – Testcases | v_patient__persinfo__dependents | List (PageShell + client feature) | None | Yes | Partial |
| patient | prescriptions | scan-prescription | Scan Prescription | Yes – Wired (/patient/presc/scan) | Yes – Wired | Not Tested | Analyze only – Testcases | N/A | Zod on API | Analyze API – Testcases | storage + audit log | Client flow (camera/upload) | Save/Submit APIs added; add tests | Yes | Partial |
| patient | prescriptions | my-prescriptions | My Prescriptions | Yes – Wired (/patient/presc/active) | Yes – Wired | Not Tested | Save/Submit – Not Tested | N/A | N/A | Save/Submit APIs exist | v_patient__presc__prescriptions | List (PageShell) | Add filters later | Yes | Partial |
| patient | prescriptions | prescription-medications | Prescription Medications | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | care-network | caregivers | Caregivers | Yes – Wired (/patient/care-network/caregivers) | Yes – Wired | Yes | Yes – Testcases | Yes – Not Tested | Yes – Not Tested | Yes – Testcases | v_patient__carenet__caregivers | List/Detail | None | Yes | Partial |
| patient | care-network | caretakers | Caretakers | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | medhist | allergies | Allergies | Yes – Wired (/patient/medhist/allergies) | Yes – Wired | Yes | Yes – Testcases | Yes – Not Tested | Yes – Testcases | Yes – Testcases | v_patient__medhist__allergies | List/Detail | None | Yes | Partial |
| patient | medhist | conditions | Medical Conditions | Yes – Wired (/patient/medhist/conditions) | Yes – Wired | Yes | Yes – Testcases | Yes – Not Tested | Yes – Not Tested | Yes – Testcases | v_patient__medhist__conditions | List/Detail | None | Yes | Partial |
| patient | medhist | immunizations | Immunizations | Yes – Wired (/patient/medhist/immunizations) | Yes – Wired | Yes | Yes – Testcases | Yes – Not Tested | Yes – Not Tested | Yes – Testcases | v_patient__medhist__immunizations | List/Detail | None | Yes | Partial |
| patient | medhist | surgeries | Surgeries | Yes – Wired (/patient/medhist/surgeries) | Yes – Wired | Yes | Yes – Testcases | Yes – Not Tested | Yes – Not Tested | Yes – Testcases | v_patient__medhist__surgeries | List/Detail | None | Yes | Partial |
| patient | medhist | family-history | Family History | Yes – Wired (/patient/medhist/family-history) | Yes – Wired | Yes | Yes – Not Tested | Yes – Not Tested | Yes – Not Tested | Yes – Not Tested | v_patient__medhist__family_hist | List/Detail | Add API tests | Yes | Partial |
| patient | vitality | vital-signs | Vital Signs | Yes – Wired (/patient/vitality/vital-signs) | Yes – Wired | Yes | Yes – Testcases | Yes – Not Tested | Yes – Not Tested | Yes – Testcases | v_patient__vitality__vital_signs | List/Detail | None | Yes | Partial |
| patient | vitality | (hub) | Vitality (Hub) | Yes – Wired (/patient/vitality) | Yes – Wired | Yes | N/A | N/A | N/A | N/A | N/A | TilePage | None | Yes | Partial |
| patient | communications | alerts | Alerts | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | communications | messages | Messages | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | communications | notifications | Notifications | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | medications | my-medications | My Medications | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | medications | medication-history | Medication History | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | medications | medication-adherence | Medication Adherence | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | lab-results | view-results | View Results | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | location | healthcare-map | Healthcare Map | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | location | nearest-services | Nearest Services | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | location | find-loved-ones | Find Loved Ones | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | deals | pharmacy-specials | Pharmacy Specials | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |
| patient | rewards | rewards-dashboard | Rewards Dashboard | Yes – Not Wired | Yes – Not Wired | No | No | No | No | No | N/A | N/A | No | No |

Notes
- Page 200 values marked “Yes” come from the latest QA run JSON; others are “Not Tested”.
- API CRUD “Yes – Testcases” exists for: caregivers, dependents, emergency-contacts, allergies, conditions, immunizations, surgeries, vital-signs. Analyze API has tests; save/submit pending tests.
- TanStack is used selectively in legacy features; SSR-first pages use client features without global query for reads. Mutations use API tests where applicable.
- Ready Prod requires completing API tests for prescriptions save/submit and family-history, and adding validation/UI polish where noted.
