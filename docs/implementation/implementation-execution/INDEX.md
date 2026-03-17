# Implementation Execution Index

## Overview
Machine-oriented prompts for AI implementation agents. Each prompt is optimized for autonomous execution with clear success criteria and reporting format.

**Master Supervisor**: [00-MASTER-SUPERVISOR.md](00-MASTER-SUPERVISOR.md)  
**Execution Timeline**: 12 weeks start-to-production (March 17 - June 15, 2026)

---

## Agent Assignments

### Phase 1: Foundation (Week 1-2) - PARALLEL

| Agent | Task | Spec | Prompt | Duration | Dependencies |
|-------|------|------|--------|----------|--------------|
| 1 | Database DDL | 22-database-complete-ddl.md | [01-database-ddl-implementation.md](01-database-ddl-implementation.md) | 2-3d | None |
| 2 | API Core | 18-complete-api-specification.md | [02-api-implementation-phase1.md](02-api-implementation-phase1.md) | 3-4d | None |
| 3 | Design System | 21-design-system-redux-architecture.md | [03-design-system-implementation.md](03-design-system-implementation.md) | 3-4d | None |
| 4 | Redux Setup | 21-design-system-redux-architecture.md | [04-redux-setup-implementation.md](04-redux-setup-implementation.md) | 3-4d | Agent-2 (mock APIs) |

**Start Date**: March 17, 2026  
**Target Completion**: March 31, 2026  
**Go/No-Go**: All 4 agents report SUCCESS with zero blocking issues

---

### Phase 2: Core Implementation (Week 2-4)

| Agent | Task | Spec | Prompt | Duration | Dependencies | Start |
|-------|------|------|--------|----------|--------------|-------|
| 5 | Backoffice Core | 20-backoffice-implementation.md | [05-backoffice-phase1.md](05-backoffice-phase1.md) | 4-5d | Agent-3, Agent-4, Agent-2 (APIs) | Apr 1 |
| 6 | Showcase Website | 19-showcase-website.md | [06-showcase-website-implementation.md](06-showcase-website-implementation.md) | 3-4d | Agent-3 (design tokens) | Apr 1 |

**Target Completion**: April 14, 2026  
**Go/No-Go**: Both agents report SUCCESS, integration tests pass

---

## Execution Flow

```
START (March 17)
    ↓
PHASE 1 (Parallel) - Week 1-2
├─ Agent-1: Database DDL
├─ Agent-2: API Phase 1
├─ Agent-3: Design System
└─ Agent-4: Redux Setup
    ↓
PHASE 2 (Sequential) - Week 2-4
├─ Agent-5: Backoffice (depends on 3,4,2)
└─ Agent-6: Showcase (depends on 3)
    ↓
PHASE 3: Integration Testing
    ↓
PHASE 4: E2E Testing
    ↓
PHASE 5: Deployment
    ↓
GO-LIVE (June 15, 2026)
```

---

## Reporting Format

Each agent reports in this format:

```
[AGENT-N] {STATUS}
Tasks: {completed}/{total}
  ✓ Task 1 (details)
  ✓ Task 2 (details)
  ✗ Task 3 (blocker: description)
Tests: unit={pass}/{total} | integration={pass}/{total} | e2e={pass}/{total}
Code: {repository_path}
Files: {count} created
Issues: {0|description_list}
Blockers: [NONE|specific_blockers]
Next: [Ready for Phase-X|Blocked by Agent-Y|Restart required]
```

---

## Specifications Reference

| # | Document | Topic | Pages | Status |
|---|----------|-------|-------|--------|
| 18 | complete-api-specification.md | 150+ REST endpoints | 50+ | Complete |
| 19 | showcase-website.md | 18-page public website | 30+ | Complete |
| 20 | backoffice-implementation.md | React + Redux platform | 40+ | Complete |
| 21 | design-system-redux-architecture.md | Colors, tokens, Redux | 40+ | Complete |
| 22 | database-complete-ddl.md | SQL schema (TBD) | 20+ | Pending |

---

## Agent Prompts Checklist

- [x] **00-MASTER-SUPERVISOR.md** - Orchestration, dependencies, timeline
- [x] **01-database-ddl-implementation.md** - PostgreSQL schema, 50+ tables, audit logging
- [x] **02-api-implementation-phase1.md** - Auth + User endpoints, middleware, config
- [x] **03-design-system-implementation.md** - Tokens, 40+ components, dark mode
- [x] **04-redux-setup-implementation.md** - Store, slices, sagas, hooks
- [x] **05-backoffice-phase1.md** - Core pages, auth guard, layouts
- [x] **06-showcase-website-implementation.md** - 18 pages, Next.js, SEO, i18n

---

## Key Success Metrics

### Phase 1 (Foundation)
- [ ] All 4 agents report SUCCESS
- [ ] Zero blocking issues
- [ ] Unit test coverage ≥85% per agent
- [ ] Database schema complete & tested
- [ ] API endpoints operational (33/150)
- [ ] Design system complete (40+ components)
- [ ] Redux store fully functional

### Phase 2 (Core)
- [ ] Backoffice core pages complete
- [ ] Showcase website live (18 pages)
- [ ] API endpoints integrated (remaining 117)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Responsive design verified (mobile, tablet, desktop)

### Phase 3+ (Testing & Deployment)
- [ ] All unit tests passing (≥80% coverage)
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Security audit complete
- [ ] Performance targets met (Lighthouse 95+)
- [ ] Accessibility verified (WCAG 2.1 AA)

---

## Agent Communication Protocol

### Supervisor → Agent (Dispatch)
```
[SUPERVISOR] → [AGENT-N]
Specification: {spec_file}.md (read first)
Task Prompt: {agent_prompt}.md (read second)
Context: {dependencies_status}
  ✓ Agent-X completed
  ⏳ Agent-Y in-progress (ETA: date)
  ❌ Agent-Z blocked (issue: description)
Priority: {P0|P1|P2}
Deadline: {date}
Slack: [optional team channel for questions]
```

### Agent → Supervisor (Report)
```
[AGENT-N] COMPLETE
Spec: {spec_file_reviewed}
Tasks: {all_completed}
Tests: unit={pass}/{total} | integration={pass}/{total} | e2e={pass}/{total}
Code: {repo_path}
Blockers: [NONE|list]
Next: Ready for [Agent-X|Phase-Y]
ETA: [date] for dependent agents
```

---

## Abort Criteria

Stop execution if:
- Agent blocked > 4 hours without resolution (escalate to human)
- 3+ test suites failing with root cause unknown
- Specification gap discovered (update spec, restart)
- Security vulnerability found (security review required)
- More than 2 agents reporting FAILED status

---

## Estimated Timeline (13 weeks total)

```
Week 1-2 (Mar 17-30): Phase 1 - Foundation (4 agents, parallel)
  Mar 17: Agents 1,2,3,4 START
  Mar 24: Mid-week checkin (all agents must be ≥50% complete)
  Mar 31: Phase 1 completion checkpoint (GO/NO-GO decision)

Week 2-4 (Mar 31-Apr 14): Phase 2 - Core Implementation
  Apr 1: Agents 5,6 START (dependent agents ready)
  Apr 7: Mid-week checkin (≥50% complete)
  Apr 14: Phase 2 completion checkpoint

Week 5 (Apr 15-21): Phase 3 - Integration Testing
  Apr 15: Agent-8 Integration Testing START
  Apr 21: All integration tests passing

Week 6 (Apr 22-28): Phase 4 - E2E Testing
  Apr 22: Agent-9 E2E Testing START
  Apr 28: All E2E tests passing

Week 7-8 (Apr 29-May 12): Phase 5 - Polish & Documentation
  May 5: Code review & security audit
  May 12: Final checklist verification

Week 9-10 (May 13-26): Phase 6 - Staging Deployment & QA
  May 19: Staging environment launch
  May 26: Final production readiness review

Week 11-12 (May 27-Jun 9): Phase 7 - Production Deployment
  Jun 1: Go-live decision meeting
  Jun 9: Production environment deployment

Week 13 (Jun 10-15): Phase 8 - Monitoring & Support
  Jun 15: Official go-live date
  Jun 15+: 24/7 support, monitoring, hotfixes
```

---

## Repository Structure

```
/docs
├── implementation/
│   ├── 18-complete-api-specification.md
│   ├── 19-showcase-website.md
│   ├── 20-backoffice-implementation.md
│   ├── 21-design-system-redux-architecture.md
│   ├── 22-database-complete-ddl.md (TBD)
│   └── implementation-execution/ (THIS FOLDER)
│       ├── 00-MASTER-SUPERVISOR.md
│       ├── 01-database-ddl-implementation.md
│       ├── 02-api-implementation-phase1.md
│       ├── 03-design-system-implementation.md
│       ├── 04-redux-setup-implementation.md
│       ├── 05-backoffice-phase1.md
│       ├── 06-showcase-website-implementation.md
│       └── INDEX.md (this file)
/backend
├── src/ (Express/Fastify API)
├── database/ (PostgreSQL schema)
└── __tests__/ (unit, integration, e2e tests)
/frontend
├── src/ (React + Redux app)
└── __tests__/ (unit, integration, e2e tests)
/showcase
├── app/ (Next.js pages)
└── __tests__/ (unit, integration, e2e tests)
```

---

## Links & References

- **System Instructions**: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **Project Overview**: [README.md](../../README.md)
- **Architecture Docs**: [docs/implementation/](../implementation/)
- **Issue Tracker**: [GitHub Issues]
- **PR Reviews**: [GitHub Pull Requests]

---

**Index Version**: 1.0  
**Created**: March 17, 2026  
**Status**: PRODUCTION-READY FOR AGENT DISPATCH
