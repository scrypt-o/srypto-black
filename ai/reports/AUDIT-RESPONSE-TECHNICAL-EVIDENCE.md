# Audit Response — Technical Evidence (Addresses & Location)

Date: 2025-09-01
Prepared by: QA Engineering

---

## Scope & Method

- Scope: Address management (Home/Postal/Delivery), Google Maps/Places usage, API/DDL alignment, security/privacy gates.
- Method: Static code review across key files; grep-based verification of behavior; no runtime execution.
- Evidence format: Status per issue with exact file references and short code excerpts.

---

## Findings Summary

- Same-as flags persistence: NOT FIXED
- Complex/Estate fields end-to-end: PARTIAL
- Geodata (lat/lng) persistence: NOT FIXED
- Full-address computation: NOT FIXED
- Centralized Google service layer: PARTIAL
- Duplicate Google loader usage: PARTIAL
- SA-specific parsing/validation: NOT FIXED
- Legacy plural view fallback: NOT FIXED
- Geolocation consent: FIXED
- Feature flags/gating (Places/Maps): PARTIAL
- Accessibility for autocomplete: NOT FIXED

---

## Detailed Findings & Evidence

### 1) Same‑As Flags Not Persisted (NOT FIXED)

- Evidence (UI drops flags in request body):
  - `components/features/patient/persinfo/AddressEditForm.tsx`
  - Excerpt:
    ```ts
    // Builds payload with flags … but does not send it
    const payload: any = { type, ...form }
    if (type === 'postal') payload.postal_same_as_home = postalSame
    if (type === 'delivery') payload.delivery_same_as_home = deliverySame
    const res = await fetch('/api/patient/personal-info/address', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, ...form })
    })
    ```
- Risk: Postal/Delivery addresses incorrectly defaulted → misdelivery of medication.
- Required Action: Send `payload` (with flags) in PUT body; add unit test for mapping.

### 2) Complex/Estate Fields (PARTIAL)

- Evidence (UI fields present):
  - `components/features/patient/persinfo/AddressEditForm.tsx`
  - Excerpt:
    ```ts
    // Complex/Estate Information
    live_in_complex?: boolean
    complex_no?: string
    complex_name?: string
    ```
- Evidence (API schema + mapping present):
  - `app/api/patient/personal-info/address/route.ts`
  - Excerpt:
    ```ts
    const complexFields = { live_in_complex: z.boolean().optional(), complex_no: z.string().max(50).optional(), complex_name: z.string().max(200).optional() }
    if (typeof payload.live_in_complex === 'boolean') map['live_in_complex'] = payload.live_in_complex
    if (payload.complex_no !== undefined) map['complex_no'] = payload.complex_no
    if (payload.complex_name !== undefined) map['complex_name'] = payload.complex_name
    ```
- Risk: If DB lacks these columns or constraints, saves will fail/succeed inconsistently.
- Required Action: Confirm DDL (`patient__persinfo__address`) contains these columns per spec; add component/API tests.

### 3) Coordinates (lat/lng) Not Persisted (NOT FIXED)

- Evidence (API accepts but UI never sends):
  - `app/api/patient/personal-info/address/route.ts`
    ```ts
    const coordinateFields = { latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional() }
    if (typeof payload.latitude === 'number') map[`${prefix}_latitude`] = payload.latitude
    if (typeof payload.longitude === 'number') map[`${prefix}_longitude`] = payload.longitude
    ```
  - `components/features/patient/persinfo/AddressEditForm.tsx`
    ```ts
    const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null)
    // …but coords are not included in fetch body
    ```
- Risk: Proximity features and map in detail view unreliable; delivery routing errors.
- Required Action: Include `latitude/longitude` into PUT body from `coords` when set; add DB columns and view exposure.

### 4) Full Address Computation (NOT FIXED)

- Evidence: No computation in API (no concatenation prior to upsert) and no DB trigger/generated columns observed.
- Risk: Downstream consumers receive inconsistent address strings.
- Required Action: Implement DB-level generated columns/trigger or server-side composition; expose via view.

### 5) Centralized Google Services Layer (PARTIAL)

- Evidence (present): `lib/services/google-services.ts` provides singleton provider (loader, autocomplete, details, nearby, usage tracking).
- Evidence (not fully adopted): `components/features/patient/persinfo/AddressAutocomplete.tsx` still directly uses `@react-google-maps/api` and `PlacesService` with its own loader.
- Risk: Inconsistent error handling, metrics, and cost control.
- Required Action: Migrate all Google interactions to `GoogleServicesProvider`.

### 6) Duplicate Google Loader Usage (PARTIAL)

- Evidence (central loader): `lib/google-maps.ts` now uses a single id `scrypto-google-maps`.
- Evidence (duplication persists): `AddressAutocomplete.tsx` uses a separate `useJsApiLoader({ id: 'gmaps-places' … })`.
- Risk: Double loading, increased latency/cost.
- Required Action: Use central loader/provider everywhere.

### 7) SA-Specific Parsing/Validation (NOT FIXED)

- Evidence (parsing):
  - `AddressEditForm.tsx` still uses `sublocality|neighborhood`, missing `sublocality_level_1`.
    ```ts
    suburb: get('sublocality') || get('neighborhood') || form.suburb
    ```
- Evidence (validation): No postal/province format checks in Zod; only length constraints.
- Risk: Poor address quality; incorrect suburb/province combinations.
- Required Action: Use `sublocality_level_1` and add SA postal/province validation and conditional requirements.

### 8) Legacy View Fallback (NOT FIXED)

- Evidence: Pages fallback to `v_patient__persinfo__addresses` if singular view fails.
  - `app/patient/persinfo/addresses/*/page.tsx`
- Risk: Contract drift; unpredictable behavior under RLS.
- Required Action: Remove fallback; enforce singular view `v_patient__persinfo__address`.

### 9) Geolocation Consent (FIXED)

- Evidence: Auto-request on mount removed; now explicit.
  - `hooks/useGeolocation.ts`
    ```ts
    // Location is now requested explicitly, not automatically on mount
    ```
- Action: None.

### 10) Feature Flags / Gating (PARTIAL)

- Evidence (flags present): `lib/utils/feature-flags.ts`, provider checks `GOOGLE_PLACES_API_ENABLED`.
- Evidence (not enforced in all consumers): `AddressAutocomplete.tsx` and `lib/google-maps.ts` don’t gate with feature flags consistently.
- Risk: Uncontrolled usage; potential cost/privacy issues.
- Required Action: Enforce flags across all consumers; add tests for disabled paths.

### 11) Accessibility — Autocomplete (NOT FIXED)

- Evidence: No ARIA combobox roles/keyboard navigation in `AddressAutocomplete.tsx`.
- Risk: Accessibility non-compliance.
- Required Action: Implement ARIA combobox pattern and keyboard handling.

---

## Compliance & Risk Statement

These repeated defects in core address/location flows are unacceptable for a medical application. They create significant risks of misdelivery of medications, privacy violations, and regulatory non-compliance (GDPR/POPIA). Immediate remediation and strengthened quality gates are mandatory.

---

## Required Remediation (48h)

- Hotfix: Persist same-as flags; include lat/lng in PUT; remove legacy view fallback.
- Implement: Full-address computation; SA parsing/validation; feature-flag gating across consumers.
- Centralize: Migrate all Google calls to `GoogleServicesProvider`; single loader id only.
- Tests: Unit (API mapping/validation), component (forms/toggles/maps/consent), E2E (home/postal/delivery flows). Coverage ≥ 80% on changed modules.

---

## Disciplinary & Process Actions

- Suspend merge rights for Address/Location paths until fixes pass QA.
- Written warning to owners for repeated failure to address critical findings.
- Mandatory training on medical-grade validation, privacy-by-design, and TDD.
- Root-cause retrospective with documented action items and deadlines.

---

## Appendix — File References

- `components/features/patient/persinfo/AddressEditForm.tsx`
- `components/features/patient/persinfo/AddressAutocomplete.tsx`
- `components/features/patient/persinfo/AddressMap.tsx`
- `components/features/patient/persinfo/AddressDetailFeature.tsx`
- `app/patient/persinfo/addresses/*/page.tsx`
- `app/api/patient/personal-info/address/route.ts`
- `lib/services/google-services.ts`
- `lib/google-maps.ts`
- `lib/utils/feature-flags.ts`
- `hooks/useGeolocation.ts`

