```

### Key Features

#### 1. Thumbnails / Badges
- If `getThumbnail(item)` returns a URL/JSX, it renders as the leading thumbnail (rounded by `avatarShape`).
- Otherwise, auto-generated letter badge with gradient and soft ring.
- 40px avatars (compact density reduces size and padding).
- Auto-generated from first letter of title
- Color-coded (cycles through 5 colors)
- 40x40px squares with rounded corners

#### 2. Severity Indicators
- Pills with text inside
- Color mapping:
  - `critical`: Red background, white text
  - `severe`: Orange background, white text
  - `moderate`: Yellow background, white text
  - `mild`: Blue background, white text
  - `normal`: Gray background, white text

#### 3. Select Mode
- Triggered by "Select" button
- Shows checkboxes on left
- Enables bulk actions (Delete, Export)
- "Select all" functionality

#### 4. Export Options
- CSV format (default)
- PDF format
- Only exports selected items

### Interactions
- Click row → Navigate to detail view (view mode)
- Click pencil → Navigate to detail view (edit mode)
- Select mode → Checkbox interaction only
- Search → Real-time filtering via URL params
- Chevron visibility configured via `showChevron`

### Extended Controls (2025)

ListView exposes layout controls so feature lists share one consistent UI and avoid per-page styling. Optional props (defaults keep prior behavior):

```ts
type ListViewProps<T> = {
  getThumbnail?: (item: T) => string | React.ReactNode | null
  showAvatar?: boolean                 // default true
  avatarShape?: 'round' | 'square'     // default 'round'
  showChevron?: boolean                // default true
  density?: 'compact' | 'comfortable'  // default 'comfortable'
  exportEnabled?: boolean              // default true
  exportFormats?: Array<'csv'|'pdf'>   // default ['csv','pdf']
  dateFormat?: 'short' | 'long'        // default 'long'
  rightColumns?: Array<{ key: string; label?: string; render?: (item: T) => React.ReactNode; align?: 'left' | 'right' }>
}
```

Allergies canonical config:

```tsx
<ListView
  items={items}
  onItemClick={...}
  onEditClick={...}
  onSearch={...}
  onFilter={...}
  onAdd={...}
  density="compact"
  avatarShape="round"
  showChevron
  exportEnabled
  exportFormats={["csv"]}
  dateFormat="short"
  getThumbnail={(item) => (item.data as any)?.preview_url || null}
  rightColumns={[
    { key: 'allergen_type', label: 'Type', render: it => (it as any).allergen_type || '–' },
    { key: 'created_at', label: 'Added', render: it => new Date((it as any).created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
  ]}
/>
```
- Chevron visibility configured via `showChevron`

### Allergies — Canonical List Config
```tsx
<ListView
  items={items}
  onItemClick={...}
  onEditClick={...}
  onSearch={...}
  onFilter={...}
  onAdd={...}
  density="compact"
  avatarShape="round"
  showChevron
  exportEnabled
  exportFormats={["csv"]}
  dateFormat="short"
  getThumbnail={(item) => (item.data as any)?.preview_url || null}
  rightColumns={[
    { key: 'allergen_type', label: 'Type', render: it => (it as any).allergen_type || '–' },
    { key: 'created_at', label: 'Added', render: it => new Date((it as any).created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
  ]}
/>
```
- [ ] Clicking row navigates to detail
- [ ] Clicking pencil opens edit mode

### DetailView
- [ ] View mode displays all fields
- [ ] Edit mode shows appropriate inputs
- [ ] Required fields are validated
- [ ] Save persists changes
- [ ] Cancel reverts changes
- [ ] Mode switching works smoothly
- [ ] Error states display correctly
- [ ] Loading states show appropriately

## Implementation Status

### Completed
- ✅ ListView base component
- ✅ DetailView base component
- ✅ AllergiesListView implementation
- ✅ Letter badges and severity pills
- ✅ Select mode and bulk operations
- ✅ Export functionality

### In Progress
- 🔄 DetailView integration with allergies
- 🔄 Other medical history modules

### Pending
- ⏳ Medications module
- ⏳ Prescriptions module
- ⏳ Personal Info module
- ⏳ Lab Results module
- ⏳ Appointments module
- ⏳ Communications module
