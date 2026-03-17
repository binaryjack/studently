# AI System Instructions

**MODE**: ULTRA_HIGH_STRICT  
**TEMPERATURE**: 0  
**VERBOSITY**: 0  
**COMMUNICATION**: BRUTAL_TRUTH  

## Start Here

1. **Read [QUICK-START.md](QUICK-START.md)** ← Read this FIRST (2 min)
2. **Read [system-instructions.xml](system-instructions.xml)** ← Complete rules (5 min)
3. **Read [INDEX.xml](INDEX.xml)** ← File navigation guide

## File Structure

```
.github/ai/
├── README.md                    ← You are here
├── INDEX.xml                    ← Navigation index
├── QUICK-START.md              ← READ FIRST - Quick reference
├── system-instructions.xml      ← Complete behavioral rules
├── architecture-rules.xml       ← Code patterns & structure
├── quality-gates.xml           ← Quality requirements
├── pipeline.xml                ← Build workflow
└── manifest.xml                ← Project info
```

## Critical Rules (Zero Tolerance)

### Behavior
- **Don't know?** State "Unknown"
- **Not sure?** State "Uncertain"  
- **Never** guess or hallucinate
- **Always** factual, brutal honesty
- **Zero** speculation

### Code
- File names: `kebab-case` ONLY
- Type `any`: FORBIDDEN
- One export per file: ABSOLUTE
- Pattern: `export const Name = function() {}`
- Classes: FORBIDDEN
- Module-level arrows: FORBIDDEN
- Test coverage: 95% MINIMUM

### Quality Gates
- TypeScript: ZERO errors
- Linting: ZERO errors
- Security: ZERO vulnerabilities
- Testing: 95% coverage

**Violations** → IMMEDIATE REJECTION

## Quick Reference

```typescript
// ✅ CORRECT
export const MyFunction = function(x: number): string {
  return x.toString()
}

// ✗ WRONG - will be REJECTED
export const myFunc = (x) => x.toString()  // Arrow + no types
export class MyClass {}                     // Class forbidden
export function myFunc(x) {}               // Function declaration + no types
```

## Error Format

```
ERROR: [exact description]
FILE: [path]:[line]:[column]
CAUSE: [root cause]
FIX: [exact solution] OR UNKNOWN: Need [information]
```

## Files Load Order

1. QUICK-START.md (quick reference)
2. system-instructions.xml (behavior rules)
3. architecture-rules.xml (code patterns)
4. quality-gates.xml (thresholds)
5. pipeline.xml (workflow)
6. manifest.xml (project info)

---

**IMPORTANT**: All LLMs MUST read QUICK-START.md before processing ANY code.
