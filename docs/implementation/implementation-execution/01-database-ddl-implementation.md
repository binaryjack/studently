# AGENT-1: Database DDL Implementation

## SYSTEM INSTRUCTIONS
Read: `.github/copilot-instructions.md` → Tech stack, code style, patterns, architecture rules.

## SPECIFICATION
Read: `docs/implementation/22-database-complete-ddl.md` (OR extract from `04-entities.md` if DDL not created)

## TASKS

### Task 1: DDL Schema
**Input**: Entity models from spec  
**Output**: `backend/database/schema.sql`
- 50+ tables (core, learning, timesheets, absences, documents, workflows, settings, audit, compliance)
- Multi-tenant (tenant_id partition key on all tables)
- Soft deletes (deleted_at field)
- Audit columns (created_at, updated_at, created_by)
- Foreign key constraints (ON DELETE CASCADE/SET NULL as appropriate)

**Code Quality**:
- PostgreSQL 15+ syntax
- Snake_case naming (student_id, not studentId)
- Comments on complex columns
- Check constraints for enums

### Task 2: Indexes
**Output**: `backend/database/indexes.sql`
- Composite indexes (tenant_id, status)
- Full-text search (TSVECTOR on searchable fields)
- Foreign key indexes
- Performance: < 100ms queries for 1M+ records

### Task 3: Constraints & Triggers
**Output**: `backend/database/constraints.sql` + `backend/database/triggers.sql`
- NOT NULL constraints (required fields)
- UNIQUE constraints (email per tenant, AVS number)
- CHECK constraints (hours > 0, date validations)
- Triggers: 
  * updated_at auto-update
  * Audit logging (audit_logs table insert)
  * Soft delete behavior (set deleted_at on CASCADE)

### Task 4: Audit Tables
**Output**: `backend/database/audit_schema.sql`
- audit_logs (timestamp, user_id, action, entity_type, entity_id, old_value, new_value, ip_address)
- gdpr_requests (type: SAR|RTBF|PORTABILITY, user_id, status, requested_at, completed_at)
- consent_records (user_id, type, timestamp, ip_address, user_agent)
- integration_logs (provider, action, status, response, timestamp)

### Task 5: Views (Optimization)
**Output**: `backend/database/views.sql`
- v_student_progress (student_id, learning_path_id, completion_percentage, avg_competency_level)
- v_timesheet_summary (student_id, week, total_hours, status, approver)
- v_absence_calendar (student_id, date, absence_type, status)
- v_compliance_report (student_id, orpa_status, laci_case, ri_case, ai_case)

### Task 6: Migrations Setup
**Output**: `backend/database/migrations/` folder
- Create migration scripts (numbered: 001_initial_schema.sql, 002_add_audit_tables.sql, etc.)
- Create migration runner (simple Node script: `npm run migrate`)
- Create rollback capability

### Task 7: Seed Data
**Output**: `backend/database/seeds/seed.sql`
- Default settings (BASE/ADVANCED/SYSTEM tiers)
- Default roles (SYSTEM_ADMIN, TENANT_ADMIN, PROFESSOR, TEACHER, MENTOR, COACH, STUDENT)
- Default competency categories (Language, Professional, Technical, Personal, Social)
- Default absence types (SICK, VACATION, PERSONAL, EXCUSED, OTHER)
- Test tenant data (1 institutional user, 50 test students, 10 learning paths)

## TESTS

### Unit Tests
**File**: `backend/__tests__/database/schema.test.ts`
- Table existence (50+ tables exist)
- Column types (varchar(255), uuid, timestamp, enum)
- Constraints exist (NOT NULL, UNIQUE, FOREIGN KEY)
- Triggers fire correctly
- Audit tables populated on INSERT/UPDATE/DELETE

**Target**: ≥95% coverage (all tables, all constraints)

### Integration Tests
**File**: `backend/__tests__/database/integration.test.ts`
- Insert student + verify audit log
- Update learning path + verify updated_at
- Soft delete student + verify deleted_at
- Multi-tenant isolation (SELECT where tenant_id filters correctly)
- Cascade delete (delete tenant → soft delete all related records)
- View performance (v_student_progress returns < 50ms for 1000 students)

**Target**: ≥90% coverage (all major operations)

### E2E Tests
**File**: `backend/__tests__/database/e2e.test.ts`
- Full lifecycle: Create student → Enroll learning path → Create timesheet → Approve → Archive
- GDPR flow: Create SAR request → Export data → Verify audit trail
- Multi-tenant: Create two tenants → Verify data isolation
- Migration: Fresh DB → Run all migrations → Verify schema integrity
- Seed data: Load seeds → Verify counts and relationships

**Target**: ≥85% coverage (all business workflows)

## REPORTING

```
[AGENT-1] DATABASE DDL
Status: [PENDING|IN-PROGRESS|COMPLETED|FAILED]
Tasks: [n/7] completed
  ✓ DDL Schema (50+ tables)
  ✓ Indexes (composite, FTS, FK)
  ✓ Constraints & Triggers
  ✓ Audit Tables
  ✓ Views (5 optimization views)
  ✓ Migrations (numbered, rollback-capable)
  ✓ Seed Data (default + test data)
Tests: unit=X/X | integration=Y/Y | e2e=Z/Z
Code: backend/database/
Files Created:
  - schema.sql (50+ tables)
  - indexes.sql
  - constraints.sql
  - triggers.sql
  - audit_schema.sql
  - views.sql
  - migrations/ (with runner)
  - seeds/seed.sql
  - __tests__/ (unit + integration + e2e)
Issues: [0|list]
Next: [Ready for Agent-2 (API Implementation)]
```

## SUCCESS CRITERIA

- [ ] All 50+ tables created per spec
- [ ] Multi-tenant constraints enforced
- [ ] Soft delete behavior working
- [ ] Audit logging on all changes
- [ ] Unit tests: ≥95% pass rate
- [ ] Integration tests: ≥90% pass rate
- [ ] E2E tests: ≥85% pass rate
- [ ] Migration system operational
- [ ] Seed data loads cleanly
- [ ] Zero blocking issues

---

**Agent-1 Version**: 1.0  
**Estimated Duration**: 2-3 days  
**Start When**: All dependencies ready (none)
