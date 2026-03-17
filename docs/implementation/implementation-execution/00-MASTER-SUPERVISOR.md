# MASTER SUPERVISOR - Implementation Orchestrator

## OBJECTIVE
Coordinate parallel/sequential execution of implementation agents across all platform components. Monitor progress, manage dependencies, aggregate reports.

## SYSTEM CONTEXT
**Project**: Studently (Government Vocational Training Platform)  
**Date**: March 17, 2026  
**Platform**: Full-featured (not MVP), Swiss confederation employment office  
**Tech Stack**: React 18 + Redux + Saga | Express.js + TypeScript | PostgreSQL | Docker

## DEPENDENCIES GRAPH
```
[DB-DDL] → [API-Implementation] → [Backoffice, Showcase]
[Design-System] → [Backoffice, Showcase]
[Redux-Setup] → [Backoffice]
```

## AGENT ASSIGNMENTS & EXECUTION

### PARALLEL EXECUTION (Week 1)
```
START → {
  [Agent-1] Database DDL (01-database-ddl-implementation.md)
  [Agent-2] API Scaffolding (02-api-implementation.md)
  [Agent-3] Design System Setup (03-design-system-implementation.md)
  [Agent-4] Redux Architecture (04-redux-setup-implementation.md)
}
```

### SEQUENTIAL (When Dependencies Ready)
```
Week 2:
[Agent-2 DB Output] → [Agent-5] API Endpoints (02-api-implementation-phase2.md)
[Agent-3 + Agent-4 Output] → [Agent-6] Backoffice Core (05-backoffice-implementation.md)
[Agent-3 Output] → [Agent-7] Showcase Website (06-showcase-website-implementation.md)
```

### EXECUTION PHASES
| Phase | Duration | Agents | Status |
|-------|----------|--------|--------|
| 1. Foundation | Wk 1-2 | 1-4 | PENDING |
| 2. Backend API | Wk 2-4 | 2,5 | PENDING |
| 3. Frontend Core | Wk 4-6 | 6 | PENDING |
| 4. Public Web | Wk 5-6 | 7 | PENDING |
| 5. Integration | Wk 7 | All | PENDING |
| 6. Testing | Wk 8 | All | PENDING |

## AGENT INVOCATION COMMAND

```bash
# Template for launching implementation agent
agent "Given the Studently implementation context at /docs/implementation/:
- Read the system-instructions from .github/copilot-instructions.md
- Read the specification file: docs/implementation/{SPEC_FILE}.md
- Execute the tasks from docs/implementation/implementation-execution/{AGENT_PROMPT}.md
- Implement unit + integration + e2e tests
- Report completion with: [AGENT_NAME] SUCCESS | SPEC | TESTS | CODE_PATH"
```

## REPORT AGGREGATION TEMPLATE

```
=== IMPLEMENTATION STATUS REPORT ===
Date: [ISO8601]
Phase: [1-6]

[AGENT-1] Database DDL
  Status: [PENDING|IN-PROGRESS|COMPLETED|FAILED]
  Tasks: [n/m] completed
  Code: [path/to/code]
  Tests: [unit: m, integration: n, e2e: p]
  Issues: [list or NONE]
  ETA: [if not completed]

[AGENT-2] API Implementation
  Status: [...]
  ...

[SUPERVISOR] Next Actions
  - Ready for Phase: [n]
  - Blockers: [list or NONE]
  - Parallel: [agent list]
  - Sequential: [dependency chain]
```

## MONITORING CRITERIA

### SUCCESS = Agent Reports
```
✓ Spec reviewed & understood
✓ Tasks completed
✓ Unit tests: [n passing]
✓ Integration tests: [m passing]
✓ E2E tests: [p passing]
✓ Code in: [repo path]
✓ Zero blocking issues
```

### FAILURE = Agent Reports
```
✗ Blockers: [list specific issues]
✗ Missing context: [what's needed]
✗ Test failures: [count + sample]
✗ Code incomplete: [what's missing]
```

## COMMUNICATION PROTOCOL

**Agent → Supervisor Report Format**:
```
[AGENT-N] {STATUS}
Tasks: {completed_count}/{total_count}
Tests: unit={pass}/{total} | integration={pass}/{total} | e2e={pass}/{total}
Code: {path}
Issues: {0|issue_list}
Next: {ready_for_phase|blocked_by}
```

**Supervisor → Agent Dispatch Format**:
```
[SUPERVISOR] → [AGENT-N]
Specification: {spec_file}.md
Task: {agent_prompt}.md
Context: {dependencies_satisfied|PENDING:{dep_name}}
Priority: {P0-P3}
Deadline: {date}
```

## AGENT PROMPTS INDEX

| Agent | Task | Spec | Prompt | Priority |
|-------|------|------|--------|----------|
| 1 | Database DDL | 22-database-ddl | 01-database-ddl-implementation.md | P0 |
| 2 | API Core | 18-api-spec | 02-api-implementation.md | P0 |
| 3 | Design System | 21-design-system | 03-design-system-implementation.md | P0 |
| 4 | Redux Setup | 21-redux-architecture | 04-redux-setup-implementation.md | P0 |
| 5 | API Phase 2 | 18-api-spec (endpoints) | 02-api-implementation-phase2.md | P1 |
| 6 | Backoffice | 20-backoffice-spec | 05-backoffice-implementation.md | P1 |
| 7 | Showcase | 19-showcase-spec | 06-showcase-website-implementation.md | P1 |
| 8 | Integration | All outputs | 07-integration-testing.md | P2 |
| 9 | E2E Testing | All code | 08-e2e-testing.md | P2 |

## KEY INSTRUCTIONS FOR AGENTS

1. **System Context**: Read `.github/copilot-instructions.md` first
2. **Specification**: Read assigned specification thoroughly
3. **Implementation**: Follow folder structure exactly as specified
4. **Testing**: 
   - Unit: ≥80% coverage
   - Integration: All API/DB interactions
   - E2E: Happy path + error scenarios
5. **Reporting**: Use exact format above, no verbosity
6. **Code Quality**: TypeScript strict mode, Zod validation, error handling
7. **Next Agent**: Indicate which agent is ready to proceed

## BOOTSTRAP CHECKLIST

- [ ] Repository initialized with all spec docs
- [ ] TypeScript 5+ configured
- [ ] ESLint + Prettier configured
- [ ] Testing framework setup (Vitest, Jest)
- [ ] Database environment ready
- [ ] API base structure (Express/Fastify)
- [ ] React project initialized (Vite)

## ESTIMATED TIMELINE

**Start Date**: Today (March 17, 2026)  
**Phase 1 Complete**: March 31, 2026 (2 weeks)  
**Phase 2 Complete**: April 14, 2026 (4 weeks)  
**Phase 3 Complete**: April 28, 2026 (6 weeks)  
**Phase 4 Complete**: May 12, 2026 (7 weeks)  
**Phase 5 Complete**: May 19, 2026 (8 weeks)  
**Phase 6 (Testing)**: June 2, 2026 (10 weeks)  

**Go-Live**: June 15, 2026 (12 weeks from start)

## ABORT CRITERIA

Stop execution if:
- Agent blocked > 4 hours (escalate to human review)
- 3+ tests failing with root cause unidentified
- Specification gap discovered (update spec, restart agent)
- Security vulnerability found (security review required)

---

**Master Supervisor Version**: 1.0  
**Status**: READY FOR AGENT DISPATCH
