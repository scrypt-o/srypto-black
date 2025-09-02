# AddressPageLayout — Spec

## Purpose
Uniquely styled address pages with a map hero and prominent search for Google Places, consistent with Patient chrome.

## Composition
- Server shell: `AddressPageLayout` (SSR) → renders `AddressPageLayoutClient`.
- Chrome: sidebar (PatientSidebar), AppHeader, MobileFooter, ChatDock.
- Content area: 4xl max width; pages render `AddressEditForm` inside.

## Map + Search
- Current: `AddressEditForm` renders its own map + large search (overlay). Future: move search/map into layout hero for unified look across home/postal/delivery.
- Search: `AddressAutocomplete` (size="lg"), 5 suggestions, keyboard accessible, labeled.
- Sticky: none; map sits at top of page content.

## A11y
- Search input has clear label, focus states, and ARIA for listbox options.
- Map region treated as decorative unless explicitly focused.

## Migration
- Pages: `/patient/persinfo/addresses/(home|postal|delivery)` updated to use `AddressPageLayout`.
- Next: centralize search/map in AddressPageLayout hero and pass selection via context/props to forms.

