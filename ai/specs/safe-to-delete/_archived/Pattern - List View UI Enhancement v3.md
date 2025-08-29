# Pattern - List View UI Enhancement v3

**Version**: 3.0  
**Date**: 2024-12-28  
**Status**: Active  
**Supersedes**: v2 (if exists)

## Overview

This specification defines the enhanced UI/UX patterns for list views in the Scrypto medical portal. It introduces modern search, filtering, and sorting capabilities while maintaining backward compatibility with existing CRUD implementations.

## Core Principles

1. **Medical-Grade Design**: Professional, trustworthy UI appropriate for healthcare
2. **Mobile-First**: Optimized for 390px viewport with progressive enhancement
3. **Accessibility**: WCAG AA compliant with full keyboard navigation
4. **Performance**: Fast response times even with 100+ records
5. **Backward Compatible**: Existing implementations continue to work

## Component Architecture

### ListViewLayout Enhanced Props

```typescript
interface ListViewLayoutProps<Row> {
  // Existing props (maintained for compatibility)
  title: string
  description?: string
  data: Row[]
  columns: Column<Row>[]
  getRowId: (row: Row) => string
  loading?: boolean
  errors?: ErrorItem[]
  
  // Enhanced search props
  searchConfig?: {
    placeholder?: string
    fields?: string[]
    debounceMs?: number
    suggestions?: string[]
    showClear?: boolean
  }
  
  // Filter system props
  filterConfig?: {
    fields: FilterField[]
    activeFilters?: Record<string, any>
    onFilterChange?: (filters: Record<string, any>) => void
    position?: 'sidebar' | 'modal' | 'dropdown'
  }
  
  // Sort configuration
  sortConfig?: {
    options: SortOption[]
    defaultSort?: { field: string; direction: 'asc' | 'desc' }
    multiSort?: boolean
  }
  
  // Display modes
  viewMode?: 'table' | 'cards' | 'compact'
  responsiveBreakpoint?: number
  
  // Action configurations
  actions?: {
    add?: { label?: string; icon?: ReactNode }
    edit?: { label?: string; icon?: ReactNode }
    delete?: { label?: string; icon?: ReactNode }
    bulk?: BulkAction[]
  }
  
  // Mobile optimizations
  mobileConfig?: {
    swipeActions?: boolean
    floatingActionButton?: boolean
    bottomSheet?: boolean
  }
}
```

## Visual Design System

### Color Palette

```scss
// Primary Colors
$primary: #0066CC;        // Medical blue - trust, professional
$primary-hover: #0052A3;
$primary-light: #E6F2FF;

// Semantic Colors
$success: #10B981;        // Green - positive outcomes
$warning: #F59E0B;        // Amber - caution
$danger: #EF4444;         // Red - critical
$info: #3B82F6;          // Blue - information

// Medical Severity Scale
$severity-mild: #60A5FA;      // Light blue
$severity-moderate: #FBBF24;   // Amber
$severity-severe: #F87171;     // Light red
$severity-critical: #DC2626;   // Dark red

// Neutral Scale
$gray: {
  50: #F9FAFB,
  100: #F3F4F6,
  200: #E5E7EB,
  300: #D1D5DB,
  400: #9CA3AF,
  500: #6B7280,
  600: #4B5563,
  700: #374151,
  800: #1F2937,
  900: #111827
}
```

### Typography

```scss
// Font Sizes
$text-xs: 0.75rem;     // 12px - metadata, labels
$text-sm: 0.875rem;    // 14px - body small
$text-base: 1rem;      // 16px - body default
$text-lg: 1.125rem;    // 18px - subheadings
$text-xl: 1.25rem;     // 20px - headings
$text-2xl: 1.5rem;     // 24px - page titles

// Font Weights
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;

// Line Heights
$leading-tight: 1.25;
$leading-normal: 1.5;
$leading-relaxed: 1.625;
```

### Spacing System

```scss
// Base unit: 4px
$space: {
  0: 0,
  1: 0.25rem,  // 4px
  2: 0.5rem,   // 8px
  3: 0.75rem,  // 12px
  4: 1rem,     // 16px
  5: 1.25rem,  // 20px
  6: 1.5rem,   // 24px
  8: 2rem,     // 32px
  10: 2.5rem,  // 40px
  12: 3rem,    // 48px
  16: 4rem,    // 64px
}
```

## Component Specifications

### 1. Enhanced Search Bar

**File**: `/components/ui/SearchBar.tsx`

```typescript
interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  debounceMs?: number
  suggestions?: string[]
  showClear?: boolean
  fields?: string[]
  onFocus?: () => void
  onBlur?: () => void
}
```

**Features**:
- Debounced input (default 300ms)
- Clear button when text present
- Search icon indicator
- Auto-complete suggestions
- Multi-field search syntax support
- Keyboard shortcuts (Cmd+K to focus)

**Visual Design**:
```scss
.search-bar {
  @apply relative w-full;
  
  input {
    @apply w-full pl-10 pr-10 py-2.5
           text-gray-900 placeholder-gray-400
           bg-white border border-gray-200 rounded-lg
           focus:ring-2 focus:ring-primary focus:border-transparent
           transition-all duration-200;
  }
  
  .search-icon {
    @apply absolute left-3 top-1/2 -translate-y-1/2
           w-5 h-5 text-gray-400;
  }
  
  .clear-button {
    @apply absolute right-3 top-1/2 -translate-y-1/2
           w-5 h-5 text-gray-400 hover:text-gray-600
           cursor-pointer transition-colors;
  }
}
```

### 2. Filter Panel

**File**: `/components/ui/FilterPanel.tsx`

```typescript
interface FilterPanelProps {
  fields: FilterField[]
  activeFilters: Record<string, any>
  onApply: (filters: Record<string, any>) => void
  onClear: () => void
  isOpen: boolean
  onClose: () => void
  position?: 'sidebar' | 'modal' | 'bottom-sheet'
}

interface FilterField {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number'
  options?: { value: string; label: string }[]
  placeholder?: string
  defaultValue?: any
}
```

**Features**:
- Slide-over panel (desktop) / Bottom sheet (mobile)
- Multiple filter types
- Filter counts per category
- Apply/Clear actions
- Preset filter combinations
- Visual feedback for active filters

**Visual Design**:
```scss
.filter-panel {
  @apply fixed right-0 top-0 h-full w-80
         bg-white shadow-xl z-50
         transform transition-transform duration-300;
  
  &.closed {
    @apply translate-x-full;
  }
  
  .filter-section {
    @apply border-b border-gray-200 py-4 px-6;
    
    .filter-label {
      @apply text-sm font-medium text-gray-700 mb-2;
    }
    
    .filter-count {
      @apply inline-flex ml-2 px-2 py-0.5
             bg-gray-100 text-gray-600 text-xs rounded-full;
    }
  }
  
  .filter-actions {
    @apply sticky bottom-0 p-4 bg-white border-t
           flex gap-3;
    
    button {
      @apply flex-1 py-2 px-4 rounded-lg font-medium
             transition-colors;
    }
  }
}
```

### 3. Applied Filters

**File**: `/components/ui/AppliedFilters.tsx`

```typescript
interface AppliedFiltersProps {
  filters: Record<string, any>
  onRemove: (key: string) => void
  onClear: () => void
}
```

**Features**:
- Horizontal chip display
- Individual remove buttons
- Clear all action
- Smooth animations
- Category:Value format

**Visual Design**:
```scss
.applied-filters {
  @apply flex items-center gap-2 py-2 px-4
         bg-gray-50 border-b border-gray-200;
  
  .filter-chip {
    @apply inline-flex items-center gap-1
           px-3 py-1.5 rounded-full
           bg-blue-50 text-blue-700 border border-blue-200
           text-sm font-medium
           hover:bg-blue-100 transition-colors;
    
    .remove-icon {
      @apply w-4 h-4 ml-1 cursor-pointer
             hover:text-blue-900;
    }
  }
  
  .clear-all {
    @apply ml-auto text-sm text-gray-600
           hover:text-gray-900 cursor-pointer;
  }
}
```

### 4. Sort Dropdown

**File**: `/components/ui/SortDropdown.tsx`

```typescript
interface SortDropdownProps {
  options: SortOption[]
  value?: { field: string; direction: 'asc' | 'desc' }
  onChange: (sort: { field: string; direction: 'asc' | 'desc' }) => void
}

interface SortOption {
  field: string
  label: string
  defaultDirection?: 'asc' | 'desc'
}
```

**Features**:
- Dropdown with sort options
- Direction toggle (asc/desc)
- Visual indicators
- Keyboard navigation

## Layout Structure

### Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────┐
│ Title                    [Search____] [Filter] [Sort] [+]│
├─────────────────────────────────────────────────────────┤
│ Applied Filters: [Chip] [Chip] [Chip]         Clear All │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Column Headers                                      │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Data Row 1                              [Edit] [Del]│ │
│ │ Data Row 2                              [Edit] [Del]│ │
│ │ Data Row 3                              [Edit] [Del]│ │
│ └─────────────────────────────────────────────────────┘ │
│ [Previous] Page 1 of 5 [Next]              10 per page  │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

```
┌─────────────────┐
│ Title           │
│ [Search_______] │
│ [Filter (2)] [+]│
├─────────────────┤
│ Filters: 2 active│
├─────────────────┤
│ ┌─────────────┐ │
│ │ Card View 1 │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ Card View 2 │ │
│ └─────────────┘ │
│                 │
│ Page 1 of 5     │
└─────────────────┘

[Floating + Button]
```

## Mobile Optimizations

### Touch Targets
- Minimum size: 44x44px
- Spacing between actions: 8px minimum
- Larger tap areas for icons

### Swipe Actions
```typescript
interface SwipeAction {
  direction: 'left' | 'right'
  action: 'edit' | 'delete' | 'archive'
  color: string
  icon: ReactNode
}
```

### Bottom Sheet Filter (Mobile)
- Max height: 80vh
- Swipe to dismiss
- Sticky apply button
- Backdrop overlay

### Floating Action Button
```scss
.fab {
  @apply fixed bottom-6 right-6 z-40
         w-14 h-14 rounded-full
         bg-primary text-white shadow-lg
         flex items-center justify-center
         transform transition-transform;
  
  &.hidden {
    @apply translate-y-20;
  }
}
```

## State Management

### Filter State
```typescript
interface FilterState {
  activeFilters: Record<string, any>
  isFilterPanelOpen: boolean
  filterHistory: Record<string, any>[]
}
```

### Search State
```typescript
interface SearchState {
  query: string
  debouncedQuery: string
  suggestions: string[]
  isSearching: boolean
}
```

### Sort State
```typescript
interface SortState {
  field: string | null
  direction: 'asc' | 'desc'
  multiSort?: Array<{ field: string; direction: 'asc' | 'desc' }>
}
```

## Accessibility Requirements

### ARIA Labels
- All interactive elements must have descriptive labels
- Form controls must have associated labels
- Status messages for filter/search results

### Keyboard Navigation
- Tab order follows logical flow
- Enter/Space to activate buttons
- Escape to close modals/panels
- Arrow keys for dropdown navigation

### Screen Reader Support
- Announce filter changes
- Announce search results
- Announce sort changes
- Live regions for dynamic content

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

## Performance Targets

### Load Times
- Initial render: <200ms
- Search response: <100ms (after debounce)
- Filter application: <150ms
- Sort operation: <100ms

### Data Handling
- Virtual scrolling for 100+ items
- Pagination for large datasets
- Lazy loading for images/media

## Migration Guide

### From v2 to v3

1. **Update imports**:
```typescript
// Old
import ListViewLayout from '@/components/layouts/ListViewLayout'

// New (same import, enhanced functionality)
import ListViewLayout from '@/components/layouts/ListViewLayout'
```

2. **Add optional enhancements**:
```typescript
// Basic usage still works
<ListViewLayout
  title="Allergies"
  data={allergies}
  columns={columns}
  getRowId={(row) => row.allergy_id}
/>

// Enhanced with new features
<ListViewLayout
  title="Allergies"
  data={allergies}
  columns={columns}
  getRowId={(row) => row.allergy_id}
  searchConfig={{
    placeholder: "Search allergies...",
    fields: ['allergen', 'reaction'],
    debounceMs: 300
  }}
  filterConfig={{
    fields: filterFields,
    activeFilters: filters,
    onFilterChange: handleFilterChange
  }}
  sortConfig={{
    options: sortOptions,
    defaultSort: { field: 'created_at', direction: 'desc' }
  }}
  viewMode="cards"
  mobileConfig={{
    swipeActions: true,
    floatingActionButton: true
  }}
/>
```

## Testing Requirements

### Visual Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (390x844)
- [ ] Dark mode
- [ ] High contrast

### Functional Testing
- [ ] Search with debouncing
- [ ] Filter application/removal
- [ ] Sort ascending/descending
- [ ] Pagination
- [ ] Mobile swipe actions
- [ ] Keyboard navigation

### Performance Testing
- [ ] 100+ items load time
- [ ] Search responsiveness
- [ ] Filter performance
- [ ] Scroll performance

### Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Keyboard-only navigation
- [ ] Color contrast validation
- [ ] Focus management

## Implementation Checklist

- [ ] Update Tailwind config with color palette
- [ ] Create SearchBar component
- [ ] Create FilterPanel component
- [ ] Create AppliedFilters component
- [ ] Create SortDropdown component
- [ ] Enhance ListViewLayout
- [ ] Add mobile optimizations
- [ ] Implement state management
- [ ] Add accessibility features
- [ ] Performance optimizations
- [ ] Migration documentation
- [ ] Testing suite

## References

- Material Design 3 Guidelines
- iOS Human Interface Guidelines
- WCAG 2.1 AA Standards
- Healthcare UX Best Practices 2025

---

**Note**: This specification maintains full backward compatibility. Existing implementations will continue to work without modification. New features are opt-in through additional props.