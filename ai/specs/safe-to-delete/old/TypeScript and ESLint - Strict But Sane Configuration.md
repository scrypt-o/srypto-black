# TypeScript & ESLint Strict Configuration Spec

## PHILOSOPHY
**Maximum safety without developer hostility**
- Catch REAL bugs that cause runtime failures
- Skip pedantic rules that just annoy
- NEVER allow disabling via comments
- Must pass before ANY commit

## TypeScript Configuration (`tsconfig.json`)

### MANDATORY STRICT SETTINGS (NEVER CHANGE)
```json
{
  "compilerOptions": {
    // CORE STRICTNESS - These catch real bugs
    "strict": true,                        // ✅ Master switch - NEVER turn off
    "noImplicitAny": true,                 // ✅ Forces explicit typing
    "strictNullChecks": true,               // ✅ Prevents null/undefined errors
    "strictFunctionTypes": true,           // ✅ Ensures function compatibility
    "strictBindCallApply": true,           // ✅ Type-checks bind/call/apply
    "noImplicitThis": true,                // ✅ Catches unbound 'this'
    "alwaysStrict": true,                  // ✅ Emits "use strict"
    
    // RUNTIME SAFETY
    "noImplicitReturns": true,             // ✅ All code paths must return
    "noFallthroughCasesInSwitch": true,    // ✅ Prevents switch case bugs
    "noUncheckedIndexedAccess": true,      // ✅ Forces null checks on arrays/objects
    "forceConsistentCasingInFileNames": true, // ✅ Prevents import casing bugs
    
    // TYPE SAFETY
    "useUnknownInCatchVariables": true,    // ✅ Catch blocks get 'unknown' not 'any'
    "exactOptionalPropertyTypes": true,    // ✅ undefined !== missing property
    
    // MODULE CORRECTNESS
    "esModuleInterop": true,               // ✅ Proper CommonJS interop
    "skipLibCheck": true,                  // ✅ Skip .d.ts checking (performance)
    "resolveJsonModule": true,             // ✅ Import JSON files
    "isolatedModules": true,               // ✅ Each file is a module
    
    // DELIBERATELY OFF (Too Annoying)
    "noUnusedLocals": false,               // ❌ ESLint handles this better
    "noUnusedParameters": false,           // ❌ ESLint handles this better
    "strictPropertyInitialization": false,  // ❌ Too annoying with React
    "noPropertyAccessFromIndexSignature": false, // ❌ Too pedantic
  }
}
```

### WHY THESE SETTINGS

**Must Have (Prevents Real Bugs):**
- `strictNullChecks` - #1 source of runtime errors
- `noImplicitAny` - Forces thinking about types
- `noUncheckedIndexedAccess` - Array[0] might not exist!
- `useUnknownInCatchVariables` - Error might not be Error object
- `exactOptionalPropertyTypes` - `{ foo?: string }` !== `{ foo: string | undefined }`

**Skip (Developer Quality of Life):**
- `noUnusedLocals/Parameters` - Let ESLint handle with warnings
- `strictPropertyInitialization` - React lifecycle makes this annoying

## ESLint Configuration (`.eslintrc.json`)

### MANDATORY RULES (NEVER DISABLE)
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    // SECURITY & CRASHES
    "no-eval": "error",                    // ✅ Prevents code injection
    "no-implied-eval": "error",            // ✅ Prevents setTimeout(string)
    "no-debugger": "error",                // ✅ No debugger in production
    "no-alert": "error",                   // ✅ No alerts in production
    
    // ASYNC BUGS
    "no-async-promise-executor": "error",  // ✅ Prevents async executor bugs
    "require-await": "error",               // ✅ Async functions must await
    "@typescript-eslint/no-floating-promises": "error", // ✅ Promises must be handled
    "@typescript-eslint/await-thenable": "error", // ✅ Only await promises
    
    // TYPE SAFETY
    "@typescript-eslint/no-explicit-any": "error", // ✅ No 'any' type
    "@typescript-eslint/no-non-null-assertion": "error", // ✅ No foo! assertions
    "@typescript-eslint/no-unsafe-assignment": "error", // ✅ Type-safe assignments
    "@typescript-eslint/no-unsafe-member-access": "error", // ✅ No any.property
    "@typescript-eslint/no-unsafe-call": "error", // ✅ No any()
    "@typescript-eslint/no-unsafe-return": "error", // ✅ No returning any
    
    // REACT SAFETY
    "react/no-unescaped-entities": "error", // ✅ Prevents JSX bugs
    "react/jsx-key": "error",              // ✅ Keys in lists
    "react/jsx-no-duplicate-props": "error", // ✅ No duplicate props
    "react/no-direct-mutation-state": "error", // ✅ No this.state mutations
    "react-hooks/rules-of-hooks": "error", // ✅ Hooks rules
    "react-hooks/exhaustive-deps": "error", // ✅ useEffect dependencies
    
    // NEXT.JS SPECIFIC
    "@next/next/no-html-link-for-pages": "error", // ✅ Use Link component
    "@next/next/no-img-element": "error",  // ✅ Use Image component
    "@next/next/no-sync-scripts": "error", // ✅ No blocking scripts
    
    // CODE QUALITY (Warnings OK)
    "no-console": ["warn", { "allow": ["warn", "error"] }], // ⚠️ Warning only
    "no-unused-vars": "off", // Let TypeScript handle
    "@typescript-eslint/no-unused-vars": ["warn", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "prefer-const": "warn",                // ⚠️ Use const when possible
    
    // DELIBERATELY OFF
    "@typescript-eslint/no-empty-function": "off", // Sometimes needed
    "react/display-name": "off",          // Annoying with arrow functions
    "react/react-in-jsx-scope": "off"     // Not needed in Next.js
  },
  "overrides": [
    {
      "files": ["app/api/**/*.ts"],
      "rules": {
        "no-console": "off"  // API routes can console.log
      }
    },
    {
      "files": ["**/*.test.ts", "**/*.test.tsx"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off" // Tests can use any
      }
    }
  ]
}
```

## PRE-COMMIT ENFORCEMENT

### Package.json Scripts
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "check": "npm run typecheck && npm run lint",
    "precommit": "npm run check"
  }
}
```

### Git Pre-commit Hook (`.husky/pre-commit`)
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running TypeScript checks..."
npm run typecheck || {
  echo "❌ TypeScript check failed. Fix errors before committing."
  exit 1
}

echo "🔍 Running ESLint..."
npm run lint || {
  echo "❌ ESLint check failed. Fix errors before committing."
  exit 1
}

echo "✅ All checks passed!"
```

## ENFORCEMENT RULES

### NEVER ALLOW:
1. `// @ts-ignore` - BANNED
2. `// @ts-nocheck` - BANNED
3. `// eslint-disable` - BANNED (except in config files)
4. `any` type - Must use `unknown` and narrow
5. Non-null assertions (`foo!`) - Must use proper checks

### MUST ALWAYS:
1. Run `npm run check` before ANY commit
2. Fix ALL errors (not just warnings)
3. Use `unknown` instead of `any`
4. Handle all promises (no floating)
5. Check array access (`arr[0]` might be undefined)

### EXCEPTIONS:
1. Test files can use `any` for mocking
2. API routes can use console.log
3. Migration files can temporarily use looser rules

## COMMON PATTERNS TO FOLLOW

### Array Access
```typescript
// ❌ BAD - might crash
const first = array[0].name

// ✅ GOOD - safe access
const first = array[0]?.name ?? 'default'
```

### Error Handling
```typescript
// ❌ BAD - assumes error type
catch (error) {
  console.log(error.message) // error might not have message
}

// ✅ GOOD - type narrowing
catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
}
```

### Async Functions
```typescript
// ❌ BAD - floating promise
onClick={() => {
  saveData() // No await!
}}

// ✅ GOOD - handled promise
onClick={async () => {
  try {
    await saveData()
  } catch (error) {
    handleError(error)
  }
}}
```

## MONITORING & METRICS

Track in CI/CD:
- TypeScript error count (must be 0)
- ESLint error count (must be 0)
- ESLint warning count (track trend)
- Build time (should not degrade)

## MIGRATION STRATEGY

For existing codebases:
1. Start with current settings
2. Fix all TypeScript errors
3. Add one strict rule at a time
4. Fix issues before adding next rule
5. Never go backwards (no loosening)

## THE GOLDEN RULE

**If it can crash at runtime, TypeScript must catch it at compile time.**

---

*This configuration is non-negotiable. It prevents real bugs without being pedantic.*