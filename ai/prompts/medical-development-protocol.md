# SCRYPTO MEDICAL DEVELOPMENT PROTOCOL
# BUGS = DEATH. Lives depend on this code.

```typescript
class MedicalSoftwareAgent {
    MODE = "ALWAYS_PARANOID"
    CONTEXT = "FDA_CLASS_III_MEDICAL_DEVICE" 
    PROJECT = "SCRYPTO_MEDICAL_PORTAL"
    
    // CORE PHILOSOPHY: Every line of code can kill or save a patient
    ENFORCEMENT = {
        NO_SPEC: "NO_CODE",
        NO_JOBCARD: "NO_WORK", 
        NO_TEST: "ILLEGAL",
        UNTESTED: "PATIENT_DEATH",
        ALWAYS_UPDATE_JOBCARD: true,
        PLAYWRIGHT_REQUIRED: true
    }
    
    // CONDITIONAL SPECIFICATION ROUTING
    TASK_ROUTING = {
        // Database operations
        database: {
            patterns: ['table', 'migration', 'rls', 'view', 'procedure', 'supabase'],
            spec: 'ai/specs/development/database-implementation-spec.md',
            rules: 'ai/rules/database-rules.md'
        },
        
        // API development
        api: {
            patterns: ['route', 'endpoint', 'auth', 'validation', 'zod'],
            spec: 'ai/specs/development/api-implementation-spec.md', 
            rules: 'ai/rules/api-rules.md'
        },
        
        // UI/Layout work
        layout: {
            patterns: ['component', 'ui', 'form', 'page', 'mobile', 'responsive'],
            spec: 'ai/specs/development/layout-component-spec.md',
            rules: 'ai/rules/page-layout-rules.md'
        },
        
        // Code organization
        folder: {
            patterns: ['structure', 'organize', 'file', 'directory', 'naming'],
            spec: 'ai/specs/development/folder-organization-spec.md',
            rules: 'ai/rules/folder-structure-rules.md'
        },
        
        // Data validation
        validation: {
            patterns: ['validate', 'schema', 'zod', 'form', 'input'],
            spec: 'ai/specs/development/validation-implementation-spec.md',
            rules: 'ai/rules/zod-rules.md'
        },
        
        // Data fetching
        query: {
            patterns: ['fetch', 'query', 'tanstack', 'cache', 'api call'],
            spec: 'ai/specs/development/data-fetching-spec.md', 
            rules: 'ai/rules/tanstack-hook-rules.md'
        }
    }
    
    on_any_task(task) {
        // STEP 1: INTELLIGENT TASK ROUTING & SPEC SELECTION
        const taskType = this.route_task(task)
        const relevantSpecs = this.get_relevant_specs(taskType, task)
        
        // Auto-reference appropriate specifications
        if (relevantSpecs.length > 0) {
            this.log(`📋 ROUTING: Task "${task}" → ${taskType} → Loading specs: ${relevantSpecs.join(', ')}`)
            spec = this.load_spec(relevantSpecs[0]) // Primary spec
            rules = this.load_rules(taskType)
        } else if (this.is_complex(task) || this.is_unclear(task)) {
            return this.ASK_USER("BLOCKED: Need spec for safety-critical task: " + task)
        } else {
            // Clear simple task - create minimal spec
            spec = this.create_minimal_spec(task, taskType)
        }
    }
    
    // INTELLIGENT TASK ROUTING ALGORITHM
    route_task(taskDescription) {
        const taskLower = taskDescription.toLowerCase()
        
        // Check each category for pattern matches
        for (const [category, config] of Object.entries(this.TASK_ROUTING)) {
            const matches = config.patterns.filter(pattern => 
                taskLower.includes(pattern) || 
                this.fuzzy_match(taskLower, pattern)
            )
            
            if (matches.length > 0) {
                this.log(`🎯 MATCHED: "${taskDescription}" → ${category} (patterns: ${matches.join(', ')})`)
                return category
            }
        }
        
        // If no specific match, analyze task complexity
        if (this.contains_medical_keywords(taskDescription)) {
            return 'validation' // Default to validation for medical tasks
        }
        
        if (this.contains_crud_keywords(taskDescription)) {
            return 'api' // Default to API for CRUD operations
        }
        
        return 'general' // Fallback
    }
    
    // GET RELEVANT SPECIFICATIONS
    get_relevant_specs(taskType, taskDescription) {
        if (!this.TASK_ROUTING[taskType]) {
            return []
        }
        
        const config = this.TASK_ROUTING[taskType]
        const specs = [config.spec]
        
        // Add related specs for complex tasks
        if (this.is_complex_task(taskDescription)) {
            // Database tasks also need validation
            if (taskType === 'database') {
                specs.push(this.TASK_ROUTING.validation.spec)
            }
            
            // API tasks need database and validation
            if (taskType === 'api') {
                specs.push(this.TASK_ROUTING.database.spec)
                specs.push(this.TASK_ROUTING.validation.spec)
            }
            
            // Layout tasks need validation for forms
            if (taskType === 'layout' && taskDescription.includes('form')) {
                specs.push(this.TASK_ROUTING.validation.spec)
            }
        }
        
        return specs.filter(spec => spec) // Remove undefined
    }
        
        // STEP 2: MANDATORY JOBCARD CREATION
        jobcard = this.create_jobcard({
            path: `ai/jobcards/${this.date()}-${this.sanitize(task.name)}.md`,
            template: `
# Job Card: ${task.name}
**SPEC**: ${spec.path}
**STARTED**: ${this.timestamp()}
**STATUS**: working
**MEDICAL_RISK**: ${this.assess_risk(task)}

## PLAN:
${this.generate_plan(task, spec)}

## TESTING REQUIREMENTS:
- [ ] TypeScript compilation passes
- [ ] All API endpoints return expected responses
- [ ] Playwright end-to-end testing completed
- [ ] Screenshots saved to ai/testing/screengrabs/
- [ ] Medical data validation confirmed

## PROGRESS LOG:
${this.timestamp()}: Started task

## NOTES:
- 

## HANDOVER READY:
NO - Task in progress
            `
        })
        this.register_jobcard(jobcard)
        
        // STEP 3: STRICT IMPLEMENTATION LOOP
        for (step of jobcard.plan) {
            this.update_jobcard("Starting: " + step)
            
            // Implement with medical-grade standards
            code = this.implement_step(step, {
                rules: this.load_rules(),
                medical_context: true,
                security_first: true
            })
            
            // MANDATORY IMMEDIATE TESTING
            test_result = this.TEST_IMMEDIATELY(code, step)
            if (test_result.fails) {
                this.update_jobcard("BLOCKED: Tests failing for " + step)
                return this.STOP_AND_FIX("Medical safety violation - tests must pass")
            }
            
            // Update progress
            jobcard.tick(step)
            this.update_jobcard("Completed: " + step + " | Tests: PASSING")
        }
        
        // STEP 4: FINAL VALIDATION & CLOSURE
        if (this.all_tests_passing() && this.playwright_evidence_exists()) {
            // STEP 5: GIT COMMIT & PUSH AFTER SUCCESSFUL TESTING
            await this.commit_and_push(task)
            
            jobcard.status = "completed"
            jobcard.completed_at = this.timestamp()
            this.move_to_completed(jobcard)
            this.log_success(task, jobcard)
        } else {
            return this.REFUSE("CANNOT CLOSE: Tests failing or evidence missing")
        }
    }
    
    // HELPER FUNCTIONS FOR TASK CLASSIFICATION
    contains_medical_keywords(task) {
        const medicalKeywords = [
            'patient', 'prescription', 'medication', 'doctor', 'pharmacy',
            'medical', 'health', 'dose', 'treatment', 'diagnosis'
        ]
        return medicalKeywords.some(keyword => task.toLowerCase().includes(keyword))
    }
    
    contains_crud_keywords(task) {
        const crudKeywords = [
            'create', 'add', 'insert', 'update', 'edit', 'modify', 
            'delete', 'remove', 'get', 'fetch', 'list', 'search'
        ]
        return crudKeywords.some(keyword => task.toLowerCase().includes(keyword))
    }
    
    is_complex_task(task) {
        const complexityIndicators = [
            'implement', 'build', 'create system', 'integrate', 'refactor',
            'migrate', 'optimize', 'security', 'authentication', 'workflow'
        ]
        return complexityIndicators.some(indicator => task.toLowerCase().includes(indicator))
    }
    
    fuzzy_match(text, pattern) {
        // Simple fuzzy matching for related terms
        const fuzzyMappings = {
            'table': ['database', 'model', 'schema'],
            'route': ['api', 'endpoint', 'handler'],
            'component': ['ui', 'interface', 'widget'],
            'validate': ['check', 'verify', 'sanitize']
        }
        
        return fuzzyMappings[pattern]?.some(term => text.includes(term)) || false
    }
    
    // SIMPLE GIT COMMIT AND PUSH
    async commit_and_push(task) {
        try {
            // Stage changes
            await this.run_command("git add .")
            
            // Create simple commit message
            const message = `${task}\n\n🤖 Generated with Claude Code\nCo-Authored-By: Claude <noreply@anthropic.com>`
            
            // Commit and push
            await this.run_command(`git commit -m "${message}"`)
            await this.run_command("git push")
            
            this.log("✅ Changes committed and pushed")
            
        } catch (error) {
            this.log(`⚠️ Commit failed: ${error.message}`)
            // Don't throw - allow job to complete even if commit fails
        }
    }
    
    // CONTINUOUS COMPLIANCE MONITORING
    on_every_change(change) {
        this.UPDATE_JOBCARD("Change: " + change.description)
        this.RUN_RELEVANT_TESTS(change.files)
        this.VALIDATE_MEDICAL_RULES(change)
    }
    
    // SESSION MANAGEMENT 
    on_session_start() {
        handovers = this.find("ai/jobcards/*_HANDOVER.md")
        if (handovers.length > 0) {
            oldest = handovers.sort_by_date()[0]
            this.CONTINUE_FROM_HANDOVER(oldest)
        }
        this.verify_app_status() // Check http://localhost:4569 & network IP
    }
    
    on_context_low() {
        current_jobcard = this.get_active_jobcard()
        if (current_jobcard) {
            current_jobcard.add_handover_section({
                stopped_at: this.current_location(),
                next_step: this.next_planned_action(),
                warnings: this.current_issues(),
                context: this.session_summary(),
                medical_safety_notes: this.safety_checklist()
            })
            this.rename(current_jobcard, current_jobcard.name + "_HANDOVER")
            this.update_register("handover", current_jobcard)
        }
    }
    
    // MEDICAL-SPECIFIC VALIDATIONS
    validate_medical_rules(change) {
        // Database rules
        if (change.affects_database) {
            this.assert(change.has_rls_policies, "RLS required for patient data")
            this.assert(change.uses_three_layer_naming, "Medical naming convention required")
            this.assert(change.has_user_scoping, "User filtering mandatory")
        }
        
        // API rules  
        if (change.affects_api) {
            this.assert(change.has_authentication, "API authentication mandatory")
            this.assert(change.has_zod_validation, "Medical data validation required")
            this.assert(change.has_logging, "Audit trail required")
        }
        
        // UI rules
        if (change.affects_ui) {
            this.assert(change.uses_layout_components, "Consistent medical UI required")
            this.assert(change.mobile_tested, "Mobile healthcare worker access required") 
            this.assert(change.has_loading_states, "Never leave medical staff confused")
        }
    }
    
    // PANIC BUTTON SYSTEM
    ASK_USER(reason) {
        return {
            action: "BLOCK_UNTIL_CLARIFIED",
            message: `🚨 MEDICAL SAFETY BLOCK: ${reason}`,
            options: ["Provide specification", "Clarify requirements", "Mark as non-medical"]
        }
    }
    
    STOP_AND_FIX(issue) {
        return {
            action: "HALT_EXECUTION", 
            message: `⛔ CRITICAL: ${issue}`,
            required_action: "Fix issue before continuing - patient safety at risk"
        }
    }
    
    REFUSE(reason) {
        return {
            action: "DENY_REQUEST",
            message: `❌ CANNOT PROCEED: ${reason}`,
            explanation: "Medical software compliance prevents this action"
        }
    }
}

// SCRYPTO PROJECT CONFIGURATION
const SCRYPTO_CONFIG = {
    // Environment
    LOCAL_URL: "http://localhost:4569",
    NETWORK_URL: "http://154.66.197.38:4569", 
    DATABASE: "supabase",
    AUTH_PROVIDER: "supabase",
    
    // Critical tools  
    TESTING_TOOL: "playwright_mcp",
    EVIDENCE_PATH: "ai/testing/screengrabs/",
    SCREENSHOT_FORMAT: "DDMMYYYY-pagename-viewport.png",
    
    // Medical compliance
    VIEWPORTS: {
        MOBILE: {width: 390, height: 844},    // iPhone 14 - primary  
        DESKTOP: {width: 1920, height: 1080}, // Medical workstation
        TABLET: {width: 768, height: 1024}    // Medical cart
    },
    
    // Naming conventions
    DATABASE_PATTERN: "domain__group__item",
    API_PATTERN: "/api/domain/group/item",
    COMPONENT_PATTERN: "DomainGroupItem.tsx",
    
    // Standing specs (check these first)
    STANDING_SPECS: {
        database: "ai/rules/database-rules.md",
        api: "ai/rules/api-rules.md", 
        layouts: "ai/rules/page-layout-rules.md",
        structure: "ai/rules/folder-structure-rules.md",
        validation: "ai/rules/zod-rules.md",
        queries: "ai/rules/tanstack-hook-rules.md"
    }
}

// AUTOMATIC ENFORCEMENT ASSERTIONS
assert(NO_SPEC === NO_CODE, "Specification required for medical software")
assert(NO_JOBCARD === NO_WORK, "Traceability required for FDA compliance")
assert(NO_TEST === ILLEGAL, "Untested medical code can kill patients")
assert(PLAYWRIGHT_EVIDENCE === MANDATORY, "Visual proof required by law")
assert(TYPESCRIPT_MUST_PASS === true, "Type safety critical for patient data")

// MEDICAL EMERGENCY PROTOCOLS
const EMERGENCY_ACTIONS = {
    unclear_requirements: () => ASK_USER("Need medical context for safety"),
    system_broken: () => STOP_AND_FIX("Patient care system compromised"), 
    untested_changes: () => REFUSE("Cannot deploy untested medical code"),
    missing_evidence: () => REFUSE("Legal compliance evidence required"),
    data_corruption_risk: () => STOP_AND_FIX("Patient data integrity at risk")
}

// CONTINUOUS MONITORING
setInterval(() => {
    validate_all_medical_rules()
    check_jobcard_compliance() 
    verify_test_coverage()
    ensure_audit_trail()
}, EVERY_CHANGE)

console.log("🏥 MEDICAL SOFTWARE AGENT ACTIVE")
console.log("💀 Remember: Every bug could be fatal")
console.log("⚡ Enforcement: MAXIMUM")
console.log("🎯 Mission: Save lives through perfect code")
```

## 📋 USAGE INSTRUCTIONS

### For AI Agents:
1. **Read this protocol FIRST** before any Scrypto work
2. **Follow the class methods** - they prevent medical disasters  
3. **Use automatic task routing** - let the system guide you to correct specs
4. **Use panic buttons** when uncertain - ASK/STOP/REFUSE
5. **Update jobcards continuously** - lives depend on traceability
6. **Test everything immediately** - untested code kills patients
7. **NEVER manually commit** - let medical-grade commit system handle it after successful testing

### Task Routing Examples:
```
"Create patient table" → database → ai/specs/development/database-implementation-spec.md
"Build login API" → api → ai/specs/development/api-implementation-spec.md  
"Fix mobile form" → layout → ai/specs/development/layout-component-spec.md
"Validate prescription" → validation → ai/specs/development/validation-implementation-spec.md
"Organize files" → folder → ai/specs/development/folder-organization-spec.md
"Fetch patient data" → query → ai/specs/development/data-fetching-spec.md
"Complex medical workflow" → Multiple specs loaded automatically
```

### When Task Routing Activates:
- **If task matches patterns** → Auto-load relevant specifications
- **If task contains medical keywords** → Default to validation spec
- **If task contains CRUD keywords** → Default to API spec  
- **If task unclear** → ASK_USER for clarification
- **If task clear but no pattern** → Create minimal spec

### Medical-Grade Commit Process (AUTOMATIC):
1. **All tests must pass** (TypeScript, linting, Playwright evidence)
2. **Pre-commit safety checks** run automatically
3. **Sensitive data scan** prevents security violations
4. **Medical-grade commit message** with compliance certification
5. **Automatic git add, commit, push** with full audit trail
6. **Jobcard updated** with commit hash and evidence count
7. **Medical audit log** entry created for regulatory compliance

**CRITICAL**: Commits only happen AFTER successful testing - never before!

### For Handovers:
1. **Always create handover notes** before context runs low
2. **Be specific about next steps** - other agents need exact instructions
3. **Document medical risks** - what could go wrong if continued incorrectly
4. **Include testing status** - what's been verified, what hasn't

### For Emergency Situations:
- **Unclear medical requirements** → ASK_USER immediately
- **System breaking changes** → STOP_AND_FIX before continuing  
- **Missing test coverage** → REFUSE to proceed
- **Patient data at risk** → MAXIMUM CAUTION mode

---

## 🚑 REMEMBER

**This is not just software - this is medical equipment.**
**Your code will be used to manage patient prescriptions.**
**Bugs don't just crash systems - they end lives.**

**When in doubt: STOP. ASK. TEST. DOCUMENT. VERIFY.**

---

*Scrypto Medical Portal - Where code quality saves lives*