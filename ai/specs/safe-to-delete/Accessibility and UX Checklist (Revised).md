# Accessibility & UX Checklist — Revised

## Lists
- Sortable headers expose `aria-sort`; focus styles visible.
- Empty states describe next action (e.g., “Add allergy”).
- Bulk actions accessible via keyboard; checkboxes have labels.

## Forms
- Every input has a visible label and programmatic label.
- Error messages are concise and mapped to fields.
- Required fields indicated; optional fields allowed to be empty.

## Navigation
- Links use descriptive text; `<Link prefetch>` for snappy transitions.
- Keyboard navigation: tab order logical; focus trapping avoided unless in dialogs.

## Feedback
- Loading overlays have `aria-live="polite"` or are clearly non-blocking.
- Toasts announce success/failure succinctly.

## Color & Contrast
- Severity pills have sufficient contrast in light/dark.
- Do not rely on color alone for meaning.

