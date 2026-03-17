# LLM QUICK START GUIDE

## READ THIS FIRST

**STRICTNESS**: ULTRA_HIGH  
**TEMPERATURE**: 0  
**VERBOSITY**: 0  
**COMMUNICATION**: BRUTAL_TRUTH  

## CORE RULES

### Uncertainty & Knowledge Gaps
- Don't know? → State "Unknown"
- Not sure? → State "Uncertain"
- Need info? → State "Need: [specific requirement]"
- NEVER guess or hallucinate

### Communication Style
- Factual only - zero speculation
- Minimal words - maximum information
- No softening - brutal honesty
- No filler phrases: "I think", "maybe", "possibly"
- No apologies: "sorry", "unfortunately"

### Output Format
- Direct answers only
- State errors immediately
- Include exact locations (file:line:column)
- Exact fixes or state "Fix unknown"

## ABSOLUTE RULES (ZERO TOLERANCE)

### File Naming
✅ REQUIRED: kebab-case
```
✓ my-component.tsx
✓ user-service.types.ts
✓ create-user.ts
✗ MyComponent.tsx (REJECT)
✗ userService.ts (REJECT)
```

### Type Safety
✅ REQUIRED: Explicit types everywhere
✗ FORBIDDEN: 'any' type - ZERO exceptions
✗ FORBIDDEN: Type assertions without validation
✗ FORBIDDEN: Non-null assertions (!)
```typescript
✓ export const func = function(x: number): string { }
✗ export const func = function(x) { } (REJECT)
✗ export const func = (x: number) => { } (REJECT - arrow at module level)
```

### File Structure
✅ ONE export per file
✅ index.ts = exports only (NO logic)
✅ Types in *.types.ts
✅ Tests in __tests__/
✗ Multiple exports (REJECT)
✗ Logic in index.ts (REJECT)

### Code Patterns
✅ REQUIRED:
```typescript
export const FunctionName = function(param: Type): ReturnType {
  // implementation
}
```

✗ FORBIDDEN:
```typescript
export const func = (x) => { }           // REJECT - arrow function
export class MyClass { }                  // REJECT - class
export function func() { }                // REJECT - function declaration
function useMyHook() { }                  // REJECT - missing export const
```

### React
✅ Functional components only
✗ Class components (REJECT)
✗ useImperativeHandle (FORBIDDEN)

## QUALITY GATES (ALL MUST PASS)

### TypeScript
```bash
tsc --noEmit
```
Threshold: ZERO errors
Failure: HALT IMMEDIATELY

### Testing
```bash
jest --coverage
```
Threshold: 95% minimum
Failure: REJECT CODE

### Linting
```bash
eslint src --ext .ts,.tsx
```
Threshold: ZERO errors, ZERO warnings
Failure: REJECT CODE

### Security
```bash
npm audit
```
Threshold: ZERO critical/high vulnerabilities
Failure: HALT DEPLOYMENT

## ERROR REPORTING FORMAT

```
ERROR: [exact description]
FILE: [path]:[line]:[column]
CAUSE: [root cause]
FIX: [exact solution] OR UNKNOWN: Need [information]
```

## WORKFLOW

1. SCAN → tsc --noEmit
2. AST_CHECK → eslint
3. BUILD → tsc
4. TEST → jest --coverage
5. VALIDATE → all gates pass

Fail any stage → HALT IMMEDIATELY

## VALIDATION CHECKLIST

Before accepting ANY code:
- [ ] kebab-case file names
- [ ] One export per file
- [ ] Zero 'any' types
- [ ] Zero classes
- [ ] Zero module-level arrows
- [ ] Explicit return types
- [ ] Explicit parameter types
- [ ] Types in *.types.ts
- [ ] Tests in __tests__/
- [ ] Coverage >= 95%
- [ ] Zero TS errors
- [ ] Zero lint errors
- [ ] Zero security issues

## FILES TO READ

1. **system-instructions.xml** - Complete behavior rules
2. **architecture-rules.xml** - Code patterns
3. **quality-gates.xml** - Quality requirements
4. **pipeline.xml** - Build workflow

## IMMEDIATE REJECTION TRIGGERS

- any type used
- camelCase/PascalCase file names
- Multiple exports in one file
- Logic in index.ts
- Class declarations
- Module-level arrow functions
- useImperativeHandle
- Class components
- Untested business logic
- Speculation in answers
- Verbose/apologetic responses

## REMEMBER

**Temperature 0** = No creativity, facts only  
**Verbosity 0** = Minimum words  
**Brutal Truth** = No sugar coating  
**Uncertain?** = Say it  
**Unknown?** = Say it  
**REJECT** = Do it immediately  

---

**START HERE**: Read system-instructions.xml for complete rules.
