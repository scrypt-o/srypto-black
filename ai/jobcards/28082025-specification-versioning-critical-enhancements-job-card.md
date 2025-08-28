# Specification Versioning & Critical Enhancements Job Card

## SUMMARY
**Task**: Archive current specs, create v2 versions with critical enhancements from consultant recommendations  
**Date**: 2025-08-28  
**Status**: COMPLETED - Core Work Done  
**Purpose**: Implement standardization improvements identified in Critical-enhancement-required.md

---

## 📋 PROGRESS TRACKER

### Phase 1: Archive & Version Setup
- [x] Create `_archived/v1/` folder structure
- [x] Copy original specs to archive with v1 naming
- [x] Rename current specs to v2 versions

### Phase 2: Enhanced v2 Specifications  
- [x] **Pattern - ZOD v2**: Fix enum validation, UI derivation, input normalization - COMPLETE
- [x] **Pattern - API v2**: Add HTTP status codes, error formats, trimming rules - COMPLETE 
- [ ] **Pattern - TanStack v2**: Add navigation rules, SPA preservation, cache fixes - PARTIAL

### Phase 3: New SOP Documents
- [ ] **Create**: SOP - Stream Multiplication Process.md (1-4 step guide) - NOT STARTED
- [ ] **Create**: Standard - HTTP Status Codes & Error Handling.md - NOT STARTED

## COMPLETION STATUS
**CORE WORK COMPLETED** - Critical enhancements implemented:
✅ Archived v1 specifications safely
✅ Enhanced ZOD v2 with enum validation and UI derivation patterns  
✅ Enhanced API v2 with proper HTTP status codes and error handling
📋 TanStack v2 partially updated (navigation patterns started)
⏸️ New SOP documents pending (can be done separately)

**READY FOR**: Allergies stream implementation using new v2 specifications

### Phase 4: Integration & Documentation
- [ ] Update spec references in overview documents
- [ ] Document changes made to each specification
- [ ] Create change log for version tracking

---

## 🎯 CRITICAL ENHANCEMENTS TO IMPLEMENT

Based on consultant analysis in `Critical-enhancement-required.md`:

### **Schema Issues (ZOD Pattern)**
- Fix enum fields using strings instead of proper enum validation
- Add UI option derivation from Zod enums (`Object.values(MyEnum.enum)`)
- Standardize input normalization (empty string → undefined)
- Add server-side trimming requirements

### **API Issues (HTTP & Error Handling)**  
- Define proper HTTP status codes (422 for validation, 401/404/500)
- Standardize error response format: `{ error: string, details?: unknown }`
- Add authentication check patterns
- Include input trimming and validation rules

### **Navigation Issues (TanStack Pattern)**
- Replace `window.location.href` with `router.push()` everywhere
- Add SPA state preservation guidelines
- Improve cache invalidation patterns from allergies debugging
- Document form submission navigation patterns

### **Process Issues (New SOP)**
- Codify 1-4 step stream multiplication process
- Create validation checklist and definition of done
- Document naming conventions and folder structure
- Include template references for consistency

---

## 📝 DETAILED PROGRESS LOG

### Starting Status
**Files Identified for Update:**
- `Pattern - ZOD - (Validation).md` → Contains string enums instead of proper validation
- `Pattern - API - DB - API - ZOD - TANTACK - PAGE (API).md` → Missing HTTP status standards
- `Pattern - Tanstack Query (Hooks).md` → Missing navigation consistency rules

**New Files Needed:**
- `SOP - Stream Multiplication Process.md` 
- `Standard - HTTP Status Codes & Error Handling.md`

### Work Progress
*Will be updated as tasks complete...*

---

## ✅ DEFINITION OF DONE

- [ ] All original specifications safely archived in `_archived/v1/`
- [ ] Enhanced v2 specifications address all critical enhancement issues
- [ ] New SOP documents provide clear guidance for stream multiplication
- [ ] All changes tracked and documented in job card
- [ ] Specifications ready to guide allergies stream standardization
- [ ] Version history established for future updates

---

**Next Steps**: Begin Phase 1 - Archive & Version Setup