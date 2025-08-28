
# Scrypto – Simple Rules (SSOT)

**Scrypto** is a unified application focused on **streamlining medical services and prescription digitalization**.  
It is **one app with multiple domains**.

## Contexts

- **Phase 1** focuses on **Patient** and **Pharmacy** roles.
    
- Both roles exist in the **same app**, and the distinction is managed by:
    
    - A **3-level naming and routing convention**.
        
    - Two **separate sidebars** after login:
        
        - Patient Sidebar (all patient-related modules).
            
        - Pharmacy Sidebar (all pharmacy-related modules).
            
    - Each sidebar includes a **navigation link back to the other role’s home page**, so switching is possible at any time.
        
- Access is enforced by **sidebar context** for phase 1 before roles — patient pages can only be reached from the Patient sidebar, and pharmacy pages from the Pharmacy sidebar.


# **Pattern Overview**

- **Level 1** → Domain (`patient`, `pharmacy`,`admin`)
    
- **Level 2** → Group (`comm`, `persinfo`, `presc`, `vitality`, etc.)
    
- **Level 3** → Item (`messages`, `profile`, `scans`, etc.)
    
- **Relation Type** → `single` (one record per user) or `many` (multiple records possible)
    
- **Canonical Mapping Name** → domain__group__item

### Organization

The app consists of  **Domains**, Patient and Pharmacy, this document contains Patient Domain Mappings 

For the **Patient domain**, the main groups and items are:

1. **Communications** → messages, alerts, notifications
    
2. **Personal Information** → profile, addresses, documents, dependents, medical aid, emergency contacts
    
3. **Prescriptions** → scanning, prescriptions, medications
    
4. **Medications** → active list, history, adherence
    
5. **Location Services** → healthcare maps, nearest services, loved ones history
    
6. **Daily Deals** → pharmacy specials
    
7. **Vitality** → body measurements, sleep, nutrition, reproductive health, mental health, vital signs, activity
    
8. **Care Network** → caregivers, caretakers
    
9. **Medical History** → allergies, conditions, family history, immunizations, surgeries
    
10. **Lab Results** → results history
    
11. **Rewards** → rewards dashboard


# INDEX ORDER - SIDEBAR PATIENT
- Home
    
- Communications
    
    - Alerts
        
    - Messages
        
    - Notifications
        
- Personal Information
    
    - Profile
        
    - Addresses
        
    - Medical Aid
        
    - Documents
        
    - Emergency Contacts
        
    - Dependents
        
- Prescriptions
    
    - Scan Prescription
        
    - My Prescriptions
        
    - Prescription Medications
        
- Medications
    
    - My Medications
        
    - Medication History
        
    - Medication Adherence
        
- Vitality
    
    - Body Measurements
        
    - Sleep Tracking
        
    - Nutrition & Diet
        
    - Reproductive Health
        
    - Mental Health
        
    - Vital Signs
        
    - Activity & Fitness
        
- Care Network
    
    - Caregivers
        
    - Caretakers
        
- Medical History
    
    - Allergies
        
    - Medical Conditions
        
    - Immunizations
        
    - Surgeries
        
    - Family History
        
- Lab Results
    
    - View Results
        
- Location
    
    - Healthcare Map
        
    - Nearest Services
        
    - Find Loved Ones
        
- Deals
    
    - Pharmacy Specials
        
- Rewards
    
    - Rewards Dashboard



## 1) Scope

- **One app, many domains**: `patient`, `pharmacy`, `admin`.
    
- Build features as **vertical slices** (DB → API → Hooks → Pages → Tests).
    

## 2) Access & Roles

- **Do not gate by sidebar.** Enforce access on the **server** + **DB RLS**.
    
- API/RSC: use `requireUser()` (and role checks).
    
- DB: RLS with `user_id = auth.uid()` (and roles where needed).
    

## 3) Naming & Paths (pick one form and keep it)

- **URL (kebab-case):** `/patient/<group>/<item>`  
    e.g. `/patient/medhist/allergies`
    
- **DB (snake_case):**
    
    - **Table:** `patient__<group>__<item>`
        
    - **View:** `v_patient__<group>__<item>`
        
- **Zod (snake_case):** field names exactly match DB.
    
- **Mapping key:** `patient__<group>__<item>` (same as table).
    
- **Canonical groups (patient):**  
    `comm, persinfo, presc, medications, location, deals, vitality, carenet, medhist, labresults, rewards`
    

## 4) Data contracts (Zod = SSOT)

- Each entity ships: **Row**, **CreateInput**, **UpdateInput**, **ListQuery**, **ListResponse**.
    
- Fields are **snake_case** and identical across DB/API/hooks/pages.
    

## 5) API pattern

- **CRUD-first** to tables/views; **soft delete** via `is_active = false` (never hard delete).
    
- **Optional RPC** only when needed: `supabase.rpc('fn_<domain>__<group>__<item>__<verb>')`.
    
- **Errors** return `{ error: string, code?: string }`.
    
- **List query** supports `?page&pageSize&search` (and optional sort/order).
    
- Next.js **App Router**: foldered `route.ts` files.
    

## 6) Hooks (TanStack)

- One file per entity exporting:  
    `useXList`, `useXById`, `useCreateX`, `useUpdateX`, `useDeleteX`, plus `XKeys`.
    
- Use mutation **callbacks** (`onSuccess/onError`), then **invalidate** relevant keys.
    

## 7) Pages (compose patterns)

- **ListViewLayout** for index/search/pagination.
    
- **DetailViewLayout** for create/edit (sticky actions, ConfirmDialog, Toast).
    
- No data fetching inside components; pages just wire **hooks ↔ layouts**.
    

## 8) Sidebar

- One reusable sidebar component, **two configs** (`patientNav`, `pharmacyNav`).
    
- Sidebar **reflects** permissions; it **does not enforce** them.
    

## 9) Database & RLS standards

- Every table has: `..._id` PK, `user_id`, `created_at`, `updated_at?`, `deleted_at?`.
    
- Views (`v_...`) used for reads; filter `deleted_at is null` in view or API.
    
- RLS enabled on all tables with owner/role policies.
    

## 10) Cardinality

- Mark items **single** (one record per user) or **many**.
    
- Examples: `profile` = single, `addresses` = many, `allergies` = many.
    

## 11) Files/Uploads (when needed)

- Supabase Storage bucket per domain; signed URLs; RLS on object paths.
    
- Use the **file-upload pattern** component.
    

## 12) Errors & Testing

- UI shows **Toast** + inline error from `{ error, code }`.
    
- Tests per entity: API happy paths + Playwright list/create/edit/delete.
    
- Save screenshots under `ai/testing/screenshots/<slug>/`.
    

---

## Tiny example (Allergies)

- **URL:** `/patient/medhist/allergies`
    
- **Table:** `patient__medhist__allergies`
    
- **View:** `v_patient__medhist__allergies`
    
- **Zod:** `AllergyRow`, `AllergyCreateInput`, `AllergyUpdateInput`, `AllergyListQuery`, `AllergyListResponse`
    
- **API:** `GET/POST /api/patient/medhist/allergies`  
    `GET/PUT/DELETE /api/patient/medhist/allergies/[allergy_id]`
    
- **Hooks:** `useAllergiesList|ById|Create|Update|Delete`
    
- **Pages:** list + create + edit using the layouts above
    

> If this sheet and a detailed spec ever disagree, **the spec wins**; update this sheet after.