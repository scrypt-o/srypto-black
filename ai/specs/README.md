# Scrypto Specifications - Reading Order and Structure

## 📖 **START HERE: Reading Order**

### **1. FIRST: Core Architecture (Read in Order)**
```
ai/specs/core/README.md              ← Overview
ai/specs/core/01-Authentication.md   ← Security foundation
ai/specs/core/02-API-Patterns.md     ← HTTP and validation patterns  
ai/specs/core/03-Database-Access.md  ← Views vs tables, RLS patterns
ai/specs/core/04-Zod-Validation.md   ← Schema definitions
ai/specs/core/05-Layout-Components.md ← Page composition
ai/specs/core/06-SSR-Architecture.md ← Server vs client patterns
ai/specs/core/07-Navigation-URL-State.md ← Routing and state
ai/specs/core/08-Component-Hierarchy.md ← File organization
ai/specs/core/09-State-Management.md ← TanStack Query patterns
```

### **2. SECOND: Implementation Guide**
```
ai/specs/STREAM-IMPLEMENTATION-GUIDE.md ← Step-by-step process for new streams
ai/specs/ALLERGIES-REFERENCE-PATTERN.md ← Perfect working example
```

### **3. THIRD: Architecture Documentation**
```
ai/docs/GENERIC-LIST-FEATURE-ARCHITECTURE.md ← Configuration-driven pattern
```

### **4. AS NEEDED: Database Schema**
```
ai/specs/ddl/DDL_INDEX.md ← Database table overview
ai/specs/ddl/{domain}__{group}__{item}_ddl.md ← Specific table docs
```

### **5. AS NEEDED: Testing**
```
ai/specs/test-specs/TEST-PATTERNS-AND-SETUP.md ← Testing standards
ai/specs/test-specs/Testing and CI (Revised).md ← CI/CD patterns
```

---

## 🏗️ **FOLDER STRUCTURE**

```
ai/specs/
├── README.md                         ← This file (reading order)
├── STREAM-IMPLEMENTATION-GUIDE.md    ← Main implementation process
├── ALLERGIES-REFERENCE-PATTERN.md    ← Perfect working example
├── core/                             ← Foundation specifications (read first)
│   ├── README.md                     ← Core overview
│   ├── 01-Authentication.md          ← Security patterns
│   ├── 02-API-Patterns.md           ← HTTP/validation
│   ├── 03-Database-Access.md        ← Data layer
│   ├── 04-Zod-Validation.md         ← Schema patterns
│   ├── 05-Layout-Components.md      ← UI composition
│   ├── 06-SSR-Architecture.md       ← Server/client split
│   ├── 07-Navigation-URL-State.md   ← Routing patterns
│   ├── 08-Component-Hierarchy.md    ← File organization
│   └── 09-State-Management.md       ← TanStack Query
├── ddl/                             ← Database specifications
│   ├── DDL_INDEX.md                 ← Table overview
│   └── {domain}__{group}__{item}_ddl.md ← Individual tables
└── test-specs/                      ← Testing standards
    ├── TEST-PATTERNS-AND-SETUP.md
    └── Testing and CI (Revised).md
```

---

## 🎯 **QUICK START: New Stream Implementation**

### **For Creating New Medical Stream:**
1. **Read**: `STREAM-IMPLEMENTATION-GUIDE.md` (step-by-step process)
2. **Reference**: `ALLERGIES-REFERENCE-PATTERN.md` (working example)  
3. **Copy**: Configuration pattern from `config/allergiesListConfig.ts`
4. **Verify**: Against DDL spec in `ddl/{table}_ddl.md`

### **For Understanding Architecture:**
1. **Read**: `core/README.md` then `01-Authentication.md` through `09-State-Management.md`
2. **Reference**: `ai/docs/GENERIC-LIST-FEATURE-ARCHITECTURE.md`

### **For Database Changes:**
1. **Read**: `ddl/DDL_INDEX.md` for overview
2. **Find**: Specific table in `ddl/{domain}__{group}__{item}_ddl.md`

---

## ⚠️ **CRITICAL RULES**

### **Spec-Code Alignment** 
- **Specs and code are quantum entangled** - they must be identical truth
- **If discrepancy found**: Code usually takes precedence (it's the working reality)
- **When uncertain**: Ask the internet for validation

### **No Contradictions Allowed**
- **Every spec must reflect working code reality**
- **No legacy patterns or outdated approaches**
- **No facade/deferral references anywhere**

### **Implementation Standards**
- **Follow STREAM-IMPLEMENTATION-GUIDE.md exactly**
- **Use ALLERGIES-REFERENCE-PATTERN.md as template**
- **All new streams use GenericListFeature + configuration pattern**

---

**BOTTOM LINE**: Start with core specs 01-09, follow STREAM-IMPLEMENTATION-GUIDE.md, copy allergies pattern. Everything else is reference material.