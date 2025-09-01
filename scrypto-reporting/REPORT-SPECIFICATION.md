# 📊 Standardized Report Specification

## 🎯 Purpose
Create a fixed format that can be rendered programmatically without AI parsing. Reports must always follow this exact structure.

## 📋 Three-Section Format

### Section 1: Report Header
```
# Report Title
## Optional Subtitle
Date: YYYY-MM-DD
Version: X.X
```

### Section 2: Stat Blocks Definition
```
## STATS
|stat-name="Total Items";stat-type="count";stat-source="all"|
|stat-name="Completion %";stat-type="percentage";stat-source="col-5,col-6";stat-condition="Yes,Complete"|
|stat-name="API Coverage";stat-type="pie";stat-source="col-8";stat-condition="Yes,Partial,No"|
|stat-name="Ready for MVP";stat-type="percentage";stat-source="col-15";stat-condition="Yes"|
```

### Section 3: Data Table
```
## DATA
| Domain | Group | Item | Status | API | DB | Ready |
| auth | login | main | Yes@green | Yes@green | Yes@green | Yes@green |
| auth | signup | form | No@red | Partial@orange | Yes@green | No@red |
```

## 🔧 Stat Block Types

### 1. Count
```
|stat-name="Total Items";stat-type="count";stat-source="all"|
```
- Counts total rows in data table

### 2. Percentage
```
|stat-name="Completion %";stat-type="percentage";stat-source="col-5,col-6";stat-condition="Yes,Complete"|
```
- Calculates % of rows where specified columns match conditions
- `stat-source`: Column numbers to check (1-indexed)
- `stat-condition`: Values that count as "complete"

### 3. Pie Chart
```
|stat-name="API Status";stat-type="pie";stat-source="col-8";stat-condition="Yes,Partial,No"|
```
- Shows distribution of values in specified column
- `stat-condition`: Categories to group by

### 4. Progress Bar
```
|stat-name="Database Progress";stat-type="progress";stat-source="col-6";stat-condition="Complete"|
```
- Shows visual progress bar
- `stat-condition`: Value that represents completion

## 🎨 Data Formatting Rules

### Colors
- `Yes@green` → Green checkmark
- `No@red` → Red X
- `Partial@orange` → Orange warning
- `In Progress@blue` → Blue circle
- `N/A` → Gray dash
- `Custom@purple` → Purple text
- `Text#ff6b35` → Hex color

### Status Values
- `Yes` → ✅ Green checkmark
- `No` → ❌ Red X
- `Complete` → ✅ Green checkmark
- `Partial` → ⚠️ Orange warning
- `In Progress` → 🔵 Blue circle
- `N/A` → - Gray dash

## 📝 Example Complete Report

```markdown
# Patient App Status Report
## Implementation Progress Dashboard
Date: 2025-08-31
Version: 1.2

## STATS
|stat-name="Total Features";stat-type="count";stat-source="all"|
|stat-name="Routes Wired";stat-type="percentage";stat-source="col-5";stat-condition="Yes"|
|stat-name="Pages Working";stat-type="percentage";stat-source="col-7";stat-condition="Yes"|
|stat-name="API Status";stat-type="pie";stat-source="col-8";stat-condition="Yes,Partial,No"|
|stat-name="MVP Ready";stat-type="percentage";stat-source="col-10";stat-condition="Yes"|

## DATA
| Domain | Group | Item | Label | Route | Sidebar | Page 200 | API | Zod | MVP Ready |
| patient | personal-info | profile | Profile | Yes@green | Yes@green | No@red | N/A | No@red | Yes@green |
| patient | personal-info | medical-aid | Medical Aid | Yes@green | Yes@green | No@red | N/A | No@red | Yes@green |
| patient | personal-info | emergency-contacts | Emergency Contacts | Yes@green | Yes@green | Yes@green | Yes@green | Yes@orange | Yes@green |
| patient | care-network | caregivers | Caregivers | Yes@green | Yes@green | Yes@green | Yes@green | Yes@orange | Yes@green |
| patient | medhist | allergies | Allergies | Yes@green | Yes@green | Yes@green | Yes@green | Yes@green | Yes@green |
```

## 🔧 Implementation Rules

### For Report Generators (AI)
1. **Always use exact section headers**: `## STATS` and `## DATA`
2. **No extra text** between sections
3. **Consistent column naming** in data table
4. **Use standard color codes** (@green, @red, @orange, @blue)
5. **N/A for not applicable** fields

### For Renderers (Programmatic)
1. **Split by `## STATS` and `## DATA`** headers
2. **Parse stat definitions** programmatically
3. **Generate stat blocks** before table
4. **Apply color formatting** automatically
5. **No AI interpretation needed**

## ✅ Benefits
- **Consistent rendering** across all reports
- **No AI parsing required** on render side
- **Flexible stat block configuration**
- **Standard color coding**
- **Easy to validate and debug**

---

**🎯 Bottom Line:** Fixed format = Reliable programmatic rendering without guesswork!