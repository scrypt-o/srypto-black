# Patient Sidebar Status — 2025-08-31

Source of truth for sidebar items (domain/group/item), current route wiring, and live QA status.

Evidence:
- QA data: `ai/testing/20250831-dashboard-status.json`
- Screenshots: `ai/testing/screenshots/20250831-*-{desktop|mobile}.png`

Legend:
- Page 200: route responds 200 on https://qa.scrypto.online
- API CRUD: create/list/get/update/delete returned 2xx during live checks
- Shots: desktop+mobile screenshots captured today

| Domain | Group       | Item               | Label                | Route (href)                                  | Page 200 | API CRUD | Shots |
|--------|-------------|--------------------|----------------------|-----------------------------------------------|----------|----------|-------|
| patient| care-network| caregivers         | Caregivers           | /patient/care-network/caregivers              | yes      | yes      | yes   |
| patient| persinfo    | dependents         | Dependents           | /patient/persinfo/dependents                  | yes      | yes      | yes   |
| patient| persinfo    | emergency-contacts | Emergency Contacts   | /patient/persinfo/emergency-contacts          | yes      | yes      | yes   |
| patient| medhist     | allergies          | Allergies            | /patient/medhist/allergies                    | yes      | yes      | yes   |
| patient| medhist     | conditions         | Medical Conditions   | /patient/medhist/conditions                   | yes      | yes      | yes   |
| patient| medhist     | immunizations      | Immunizations        | /patient/medhist/immunizations                | yes      | yes      | yes   |
| patient| medhist     | surgeries          | Surgeries            | /patient/medhist/surgeries                    | yes      | yes      | yes   |
| patient| medhist     | family-history     | Family History       | /patient/medhist/family-history               | yes      | (n/a)    | yes   |
| patient| vitality    | vital-signs        | Vital Signs          | /patient/vitality/vital-signs                 | yes      | yes      | yes   |
| patient| vitality    | (hub)              | Vitality (Hub)       | /patient/vitality                             | yes      | (n/a)    | yes   |
| patient| home        | (root)             | Home                 | /patient                                      | (n/a)    | (n/a)    | (n/a) |
| patient| communications| alerts           | Alerts               | (not wired)                                   | no       | no       | no    |
| patient| communications| messages         | Messages             | (not wired)                                   | no       | no       | no    |
| patient| communications| notifications    | Notifications        | (not wired)                                   | no       | no       | no    |
| patient| persinfo    | profile            | Profile              | (not wired)                                   | no       | no       | no    |
| patient| persinfo    | addresses          | Addresses            | (not wired)                                   | no       | no       | no    |
| patient| persinfo    | medical-aid        | Medical Aid          | (not wired)                                   | no       | no       | no    |
| patient| persinfo    | documents          | Documents            | (not wired)                                   | no       | no       | no    |
| patient| prescriptions| scan-prescription | Scan Prescription    | (not wired)                                   | no       | no       | no    |
| patient| prescriptions| my-prescriptions  | My Prescriptions     | (not wired)                                   | no       | no       | no    |
| patient| prescriptions| prescription-medications | Prescription Medications | (not wired)                          | no       | no       | no    |
| patient| medications | my-medications     | My Medications       | (not wired)                                   | no       | no       | no    |
| patient| medications | medication-history | Medication History   | (not wired)                                   | no       | no       | no    |
| patient| medications | medication-adherence| Medication Adherence| (not wired)                                   | no       | no       | no    |
| patient| vitality    | body-measurements  | Body Measurements    | (not wired)                                   | no       | no       | no    |
| patient| vitality    | sleep-tracking     | Sleep Tracking       | (not wired)                                   | no       | no       | no    |
| patient| vitality    | nutrition-diet     | Nutrition & Diet     | (not wired)                                   | no       | no       | no    |
| patient| vitality    | reproductive-health| Reproductive Health  | (not wired)                                   | no       | no       | no    |
| patient| vitality    | mental-health      | Mental Health        | (not wired)                                   | no       | no       | no    |
| patient| vitality    | activity-fitness   | Activity & Fitness   | (not wired)                                   | no       | no       | no    |
| patient| care-network| caretakers         | Caretakers           | (not wired)                                   | no       | no       | no    |
| patient| lab-results | view-results       | View Results         | (not wired)                                   | no       | no       | no    |
| patient| location    | healthcare-map     | Healthcare Map       | (not wired)                                   | no       | no       | no    |
| patient| location    | nearest-services   | Nearest Services     | (not wired)                                   | no       | no       | no    |
| patient| location    | find-loved-ones    | Find Loved Ones      | (not wired)                                   | no       | no       | no    |
| patient| deals       | pharmacy-specials  | Pharmacy Specials    | (not wired)                                   | no       | no       | no    |
| patient| rewards     | rewards-dashboard  | Rewards Dashboard    | (not wired)                                   | no       | no       | no    |

Notes:
- (n/a) under API CRUD indicates a hub page or a read-only listing that doesn’t map 1:1 to a CRUD API entity.
- “not wired” means the sidebar entry exists in `config/patientNav.ts` but has no `href` yet; not part of this QA release.

