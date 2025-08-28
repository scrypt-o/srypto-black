# Job Card: Layout Architecture Specifications Creation
**Date:** 26/08/2025  
**Status:** IN PROGRESS  
**Priority:** CRITICAL  
**Category:** ARCHITECTURE/LAYOUTS

## Problem Statement
After cleaning up 11 legacy layout components and keeping only 3 core layouts (ListViewLayout, DetailViewLayout, TileGridLayout), we need a proper layout architecture to prevent the disasters experienced:
- Child components breaking parent layouts with flexbox issues
- Mobile layouts exploding due to overflow
- Hours wasted on layout debugging
- Scrolling and containment issues

## Investigation Findings

### What We Have:
1. **3 Core Layouts** (already rewritten from spec):
   - `components/layouts/ListViewLayout.tsx` - ✅ Using Lucide, framer-motion, clsx
   - `components/layouts/DetailViewLayout.tsx` - ✅ Using Lucide, framer-motion, clsx  
   - `components/layouts/TileGridLayout.tsx` - ✅ Using Lucide, framer-motion, clsx

2. **Existing Sidebar Spec**:
   - Location: `/ai/specs/Layout and use - Sidebar (mobile and desktop).md`
   - Uses: Lucide-react, framer-motion, clsx
   - Patterns: `flat | elevated | glass` styles, `none | subtle` motion
   - Has proper auth with `useAuth()` and `signOut()`

### What We Need:
- AppHeader component
- BottomBar component  
- AppShell master container
- Composed layouts (ListPageLayout, TilePageLayout)

## Solution Approach

### Architecture Pattern:
```
AppShell (Master Container - h-screen, overflow-hidden)
├── NavSidebar (h-full, overflow-y-auto)
└── Main Container (flex-1, min-w-0)
    ├── AppHeader (fixed height: 56/64px)
    ├── Content Area (flex-1, min-h-0, overflow-y-auto)
    └── BottomBar (fixed height: 64/56px)
```

### Key Safety Rules Implemented:

1. **Height Management**:
   - AppShell: `h-screen` or `h-[100dvh]` (dynamic viewport)
   - All scrollable areas: `overflow-y-auto overflow-x-hidden`
   - Fixed heights for header/footer

2. **Flex Safety**:
   - ALL flex children: `min-w-0 min-h-0` (prevents explosion)
   - Shrinkable elements: `flex-shrink-0` where needed
   - Container constraints: `max-w-full`

3. **Overflow Control**:
   - Every container has explicit overflow rules
   - `overscroll-behavior: contain` prevents scroll chaining
   - Text elements: `truncate` class prevents expansion

4. **Mobile Safety**:
   - Dynamic viewport height: `100dvh`
   - iOS safe areas: `pb-safe`
   - Touch targets: minimum 44px

## Specifications Created

### 1. AppHeader Component (`/ai/specs/Layout - AppHeader Component - (AppHeader).md`)
**Features:**
- Fixed height: 56px mobile, 64px desktop
- Mobile hamburger menu
- Search bar (hideable)
- User menu dropdown
- Notifications badge
- Styles: flat/elevated/glass
- Motion: none/subtle
- All text truncates, nothing breaks layout

**Safety Guarantees:**
- Height never changes
- No horizontal overflow
- Dropdowns absolutely positioned
- All flex children have min-w-0

### 2. BottomBar Component (`/ai/specs/Layout - BottomBar Component - (BottomBar).md`)
**Features:**
- Fixed height: 64px mobile, 56px desktop
- Tab navigation (3-5 tabs)
- Optional center FAB button
- Badge support
- iOS safe area support
- Active tab indicator

**Safety Guarantees:**
- Respects safe areas
- Touch targets 44px minimum
- Tab widths constrained
- Badges absolutely positioned

### 3. AppShell Component (`/ai/specs/Layout - AppShell Component - (AppShell).md`)
**THE MASTER CONTAINER - Controls Everything**

**Features:**
- Enforces viewport containment
- Orchestrates all layout components
- Prevents body scroll
- Handles iOS viewport changes
- Sidebar left/right options
- Content width options (full/constrained)

**Safety Guarantees:**
- Nothing escapes viewport
- Body scroll locked
- All children constrained
- Overflow regions explicit
- Dynamic viewport height support

### 4. Composed Layouts (in AppShell spec)
**ListPageLayout**: AppShell + NavSidebar + AppHeader + ListViewLayout
**TilePageLayout**: AppShell + NavSidebar + AppHeader + TileGridLayout

## Critical Patterns Established

### CSS Safety Classes:
```css
/* Flex child safety */
.min-w-0 /* Can shrink below content */
.min-h-0 /* Can shrink below content */

/* Overflow control */
.overflow-hidden /* Nothing escapes */
.overflow-y-auto /* Vertical scroll only */
.overflow-x-hidden /* No horizontal scroll */

/* Text safety */
.truncate /* Never wraps or expands */

/* iOS safety */
.pb-safe /* padding-bottom: env(safe-area-inset-bottom) */
```

### Component Hierarchy:
```
Parent Controls → Child Obeys
AppShell → Sidebar (256px wide, scroll yourself)
AppShell → Header (64px tall, never change)
AppShell → Content (remaining space, scroll yourself)
AppShell → BottomBar (64px tall, stay at bottom)
```

## What This Prevents

✅ Prevents all the issues experienced:
- Flexbox children exploding parent bounds
- Mobile browser chrome causing shifts
- Tables breaking page width
- Nested scrollables causing chaos
- iOS elastic scrolling issues
- Content pushing layout around

## Next Steps

1. **Implement components** in this order:
   - NavSidebar (from existing spec)
   - AppHeader
   - BottomBar
   - AppShell
   - ListPageLayout
   - TilePageLayout

2. **File Structure**:
   ```
   components/
   ├── layouts/
   │   ├── components/
   │   │   ├── NavSidebar.tsx
   │   │   ├── AppHeader.tsx
   │   │   └── BottomBar.tsx
   │   ├── AppShell.tsx
   │   ├── ListPageLayout.tsx
   │   └── TilePageLayout.tsx
   ```

3. **Create demo page** at `/app/demo/layout-test/page.tsx`

4. **Test with Playwright** and save screenshots

## Key Decisions Made

1. **Purist but Practical**: Strict containment rules but not overly complex
2. **Parent-Child Hierarchy**: Parent always controls dimensions
3. **Mobile-First**: Every decision considers mobile constraints
4. **Consistent Patterns**: All components follow sidebar's established patterns
5. **Safety Over Flexibility**: Better to be restrictive and safe

## References
- NavSidebar spec: `/ai/specs/Layout and use - Sidebar (mobile and desktop).md`
- Component patterns: `/ai/specs/Components - Basic Components - Dialog Toast Empty.md`
- Core layouts: Already implemented with Lucide + framer-motion + clsx

## Notes
These specs are "master's exam quality" - bulletproof patterns that make layout disasters physically impossible. Every pixel is accounted for, every overflow is controlled, and the parent-child hierarchy is strictly enforced.

---
*Job Card Created: 26/08/2025*