# Entity Normalization Guide

## Overview

The Studently entity model has been redesigned using **fully normalized, one-to-many relationship patterns** inspired by proven resume/CV management systems.

**Key Principle**: Instead of embedding dependent data directly in parent entities, separate them into their own normalized tables with foreign key relationships.

## Before vs After

### ❌ Old (Denormalized) Approach

```typescript
interface Student extends BaseEntity {
  firstName: string;
  lastName: string;
  
  // Embedded contact info
  email: string;
  phone?: string;
  mobilePhone?: string;
  
  // Embedded address
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  canton?: string;
  country?: string;
  
  // Embedded emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Embedded Swiss fields
  orpNumber?: string;
  avsNumber?: string;
  employmentStatus?: string;
  
  // Embedded arrays
  responsibilities?: string[];
  competencyCodes?: string[];
  referenceContacts?: string[];
}
```

**Problems**:
- What if student has 2 emails or 3 phone numbers?
- What if employment status changes multiple times? No audit trail.
- No type discrimination (which phone is mobile vs home?)
- Arrays can't be indexed efficiently
- Hard to query "all students with work email ending in @company.com"

### ✅ New (Normalized) Approach

```typescript
// Core student - minimal identity
interface Student extends BaseEntity {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  enrollmentDate: string;
  currentStatus: string;
}

// Contact info - separate normalized table
interface ContactInfo extends BaseEntity {
  studentId: string; // FK to Student
  type: 'email' | 'phone' | 'mobile' | 'whatsapp' | 'linkedin'; // Type discriminator
  value: string;
  label?: string; // "Work", "Personal"
  isPreferred: boolean;
  verifiedAt?: string;
}

// Phone number - specialized, structured
interface PhoneNumber extends BaseEntity {
  studentId: string; // FK to Student
  type: 'mobile' | 'home' | 'work';
  countryCode: string; // "+41"
  areaCode?: string;
  number: string;
  canReceiveSms: boolean;
  canReceiveWhatsapp: boolean;
}

// Address - multiple addresses supported
interface Address extends BaseEntity {
  studentId: string; // FK to Student
  type: 'residential' | 'billing' | 'work' | 'mailing';
  streetAddress: string;
  city: string;
  postalCode: string;
  isPreferred: boolean;
  isCurrent: boolean;
  moveInDate?: string;
  moveOutDate?: string;
}

// Swiss employment - audit trail of status changes
interface SwissEmploymentRecord extends BaseEntity {
  studentId: string; // FK to Student
  status: 'LACI' | 'RI' | 'AI' | 'EMPLOYED' | 'UNEMPLOYED';
  orpNumber?: string;
  avsNumber?: string;
  effectiveDate: string;
  endDate?: string; // null if current
  isCurrent: boolean;
  verifiedAt?: string;
  source: 'MANUAL_ENTRY' | 'ORP_INTEGRATION' | 'DOCUMENT_UPLOAD';
}

// Emergency contacts - multiple contacts supported
interface EmergencyContact extends BaseEntity {
  studentId: string; // FK to Student
  priority: 1 | 2 | 3 | 4 | 5;
  name: string;
  relationship: string;
  phoneNumberId?: string; // FK to PhoneNumber (if exists)
  canReceiveAcademicInfo: boolean;
  canReceiveFinancialInfo: boolean;
}

// Responsibility - separate per experience
interface ExperienceResponsibility extends BaseEntity {
  experienceId: string; // FK to Experience
  responsibility: string;
  displayOrder: number;
}

// Reference - multiple per experience
interface ExperienceReference extends BaseEntity {
  experienceId: string; // FK to Experience
  contactName: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  relationship: 'manager' | 'colleague' | 'mentor';
}
```

**Benefits**:
- ✅ Student can have unlimited emails, phones, addresses
- ✅ Complete audit trail of employment status changes
- ✅ Type discrimination (work email vs personal, mobile vs home)
- ✅ Efficient indexing on type, value, date fields
- ✅ Easy querying: "get all students with verified emails"
- ✅ Single source of truth (one email address in one place)
- ✅ Better data integrity (no duplicate emails)

## Normalization Patterns Applied

### Pattern 1: One-to-Many Relationships

**Use Case**: When a parent entity can have multiple instances of a child entity.

**Example**: Student → Addresses (residential, billing, work)

**Implementation**:
- Create separate Address table
- Add FK `student_id` to Address
- Add discriminator column `type` for categorization
- Add `is_preferred` flag for each type
- Index on (tenant_id, student_id, type)

```typescript
// Bad: Embedded array
Student { addresses: Address[] }

// Good: Normalized relationship
Student (core)
  + Address[] (separate table)
    { student_id, type, street, city, is_preferred, is_current }
```

### Pattern 2: Type Discriminators

**Use Case**: When a single table holds multiple variants of similar data.

**Example**: ContactInfo can be email, phone, mobile, LinkedIn, WhatsApp

**Implementation**:
- Use single `contact_infos` table
- Add `type` enum column
- Query by type: `WHERE type = 'email'`
- Add index on (tenant_id, type, value)

```typescript
ContactInfo {
  id, student_id, type, value, is_preferred, verified_at
}

// Query emails
SELECT * FROM contact_infos WHERE type = 'email' AND student_id = X

// Query preferred contact method
SELECT * FROM contact_infos WHERE type = 'email' AND student_id = X AND is_preferred = true
```

### Pattern 3: Audit Trail Records

**Use Case**: When status changes need to be tracked with history and metadata.

**Example**: SwissEmploymentRecord tracks LACI/RI/AI status over time

**Implementation**:
- Create record per status change
- Add `effective_date` and `end_date` (null if current)
- Add `is_current` flag for quick access
- Add `verified_at` and `source` for compliance
- Query current: `WHERE is_current = true`
- Query history: `WHERE student_id = X ORDER BY effective_date DESC`

```typescript
SwissEmploymentRecord {
  student_id, status, orp_number, effective_date, end_date,
  is_current, verified_at, source
}

// Get current status
SELECT * FROM swiss_employment_records
WHERE student_id = X AND is_current = true

// Get status history
SELECT * FROM swiss_employment_records
WHERE student_id = X
ORDER BY effective_date DESC
```

### Pattern 4: Structured vs Semi-Structured

**Use Case**: When some attributes need structure/type-safety, others need flexibility.

**Example**: PhoneNumber has structured fields (countryCode, areaCode, number) while ContactInfo is flexible (type + value string)

**Implementation**:
- Use PhoneNumber for high-volume querying by phone prefix
- Use ContactInfo for misc contact methods
- Both reference Student via FK
- Index PhoneNumber.full_number for direct lookup

```typescript
// Structured (indexed, queryable)
PhoneNumber { student_id, country_code, area_code, number, type }
CREATE INDEX idx_phone ON phone_numbers(country_code, area_code, number)

// Flexible (general purpose)
ContactInfo { student_id, type, value, is_preferred }
CREATE INDEX idx_contact ON contact_infos(type, value)
```

### Pattern 5: Versioning with Chains

**Use Case**: When documents or records have multiple versions, maintain chain relationships.

**Example**: StudentDocument → DocumentVersion (linked via document_id)

**Implementation**:
- StudentDocument is parent (logical grouping)
- DocumentVersion stores actual file + metadata
- Add `is_latest_version` flag for quick access
- Add `previous_version_id` for diff/comparison
- Query versions: `WHERE document_id = X ORDER BY version DESC`

```typescript
StudentDocument {
  id, student_id, title, category_code, is_latest_version
}

DocumentVersion {
  id, document_id, version, file_url, file_name,
  change_description, changed_by_user_id, is_current_version
}

// Get document with latest version
SELECT d.*, dv.* FROM student_documents d
JOIN document_versions dv ON d.id = dv.document_id
WHERE d.id = X AND dv.is_current_version = true
```

## Entity Relationships

### Student Hub (1:N Relationships)

```
Student (core)
  │
  ├─ ContactInfo[] (email, phone, mobile, etc.)
  ├─ PhoneNumber[] (structured phone numbers)
  ├─ Address[] (residential, billing, work, mailing)
  ├─ EmergencyContact[] (priority-ordered)
  │
  ├─ StudentDocument[] (CV, certificates, cover letter)
  │   └─ DocumentVersion[] (file history)
  │
  ├─ SwissEmploymentRecord[] (LACI/RI/AI status audit trail)
  ├─ StudentLicense[] (work permits, certifications)
  │
  ├─ Experience[] (work, internship, volunteer)
  │   ├─ ExperienceResponsibility[] (bullet points)
  │   └─ ExperienceReference[] (contacts)
  │
  ├─ Achievement[] (awards, publications, certs)
  │
  ├─ StudentCompetency[] ──┐ (junction table)
  │                        └──→ Competency (skill definitions)
  │
  ├─ Timesheet[] (weekly summaries)
  │   └─ TimesheetEntry[] (daily entries)
  │       ├──→ Project
  │       └──→ TaskType
  │
  ├─ Absence[] (sickness, vacation, personal)
  │   └─ AbsenceDocument[] (medical certs, etc.)
  │
  ├─ Evaluation[] (competency, course, project)
  │   └─ EvaluationCriteria[] (individual scores)
  │
  └─ Report[] (progress, final, custom)
```

## Query Examples

### Get Student with All Contact Information

```typescript
// Method 1: Multiple queries (N+1, but explicit)
const student = await studentRepo.findById(studentId);
const emails = await contactInfoRepo.find({ studentId, type: 'email' });
const phones = await phoneNumberRepo.find({ studentId });
const addresses = await addressRepo.find({ studentId });

// Method 2: Single JOIN query
const student = await db.query(`
  SELECT 
    s.*,
    json_agg(json_build_object('type', 'email', 'value', ci.value))
      FILTER (WHERE ci.type = 'email') as emails,
    json_agg(json_build_object('type', 'address', ...a.*))
      FILTER (WHERE a.type IS NOT NULL) as addresses
  FROM students s
  LEFT JOIN contact_infos ci ON s.id = ci.student_id
  LEFT JOIN addresses a ON s.id = a.student_id
  WHERE s.id = ?
  GROUP BY s.id
`);
```

### Find Students with Specific Contact Info

```typescript
// Students with verified work emails
const workEmailStudents = await db.query(`
  SELECT DISTINCT s.* FROM students s
  JOIN contact_infos ci ON s.id = ci.student_id
  WHERE ci.type = 'email' AND ci.value LIKE '%@company.com'
  AND ci.verified_at IS NOT NULL
`);

// Students in specific canton
const zurichStudents = await db.query(`
  SELECT DISTINCT s.* FROM students s
  JOIN addresses a ON s.id = a.student_id
  WHERE a.type = 'residential' AND a.is_current = true
  AND a.canton = 'ZH'
`);

// Students with current LACI status
const laciStudents = await db.query(`
  SELECT DISTINCT s.* FROM students s
  JOIN swiss_employment_records ser ON s.id = ser.student_id
  WHERE ser.status = 'LACI' AND ser.is_current = true
`);
```

### Employment Status Audit Trail

```typescript
// Get complete employment history for student
const history = await db.query(`
  SELECT * FROM swiss_employment_records
  WHERE student_id = ? AND is_active = true
  ORDER BY effective_date DESC
`);

// When did student last change status?
const lastChange = await db.query(`
  SELECT * FROM swiss_employment_records
  WHERE student_id = ? AND is_active = true
  ORDER BY effective_date DESC
  LIMIT 1
`);

// Timeline visualization
const timeline = history.map(record => ({
  period: `${record.effectiveDate} → ${record.endDate || 'current'}`,
  status: record.status,
  source: record.source,
  verified: record.verifiedAt ? '✓' : '✗'
}));
```

## Data Integrity & Constraints

### Unique Constraints

```sql
-- One residential address active at a time (per student/tenant)
ALTER TABLE addresses
ADD CONSTRAINT unique_current_residential
UNIQUE (tenant_id, student_id, type)
WHERE is_current = true AND type = 'residential';

-- One preferred email contact
ALTER TABLE contact_infos
ADD CONSTRAINT unique_preferred_email
UNIQUE (tenant_id, student_id)
WHERE is_preferred = true AND type = 'email';

-- Current employment record
ALTER TABLE swiss_employment_records
ADD CONSTRAINT unique_current_employment
UNIQUE (tenant_id, student_id)
WHERE is_current = true;
```

### Foreign Key Cascades

```sql
-- When student deleted, cascade to all related
ALTER TABLE contact_infos
ADD CONSTRAINT fk_student
FOREIGN KEY (student_id) REFERENCES students(id)
ON DELETE CASCADE;

-- Similarly for: addresses, phones, documents, experiences, etc.
```

## Migration Strategy

When transitioning from denormalized to normalized schema:

```sql
-- 1. Create new normalized tables
CREATE TABLE contact_infos (...);
CREATE TABLE phone_numbers (...);
CREATE TABLE addresses (...);
-- etc.

-- 2. Migrate data from old Student table
INSERT INTO contact_infos (tenant_id, student_id, type, value, ...)
SELECT tenant_id, id, 'email', email, ... FROM students
WHERE email IS NOT NULL;

-- 3. Verify migration
SELECT COUNT(*) FROM students WHERE email IS NULL;
SELECT COUNT(*) FROM contact_infos WHERE type = 'email';

-- 4. Drop old columns
ALTER TABLE students DROP COLUMN email, phone, mobile_phone,
  street_address, city, postal_code, canton, country,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
  orp_number, employment_status, avs_number;

-- 5. Add NOT NULL constraints to remaining columns
ALTER TABLE contact_infos ALTER COLUMN value SET NOT NULL;
```

## Benefits Summary

| Aspect | Denormalized | Normalized |
|--------|--------------|-----------|
| **Flexibility** | ❌ Fixed fields | ✅ Unlimited records |
| **Type Safety** | ❌ All in one | ✅ Type discriminated |
| **Audit Trail** | ❌ No history | ✅ Full history (dates) |
| **Query Perf** | ⚠️ LIKE on embedded | ✅ Indexed lookups |
| **Data Integrity** | ❌ Duplicates possible | ✅ Unique constraints |
| **Compliance** | ❌ Hard to track changes | ✅ Full verification trail |
| **Scalability** | ❌ Bloated rows | ✅ Lean normalized rows |
| **Complexity** | ✅ Simple ORM | ⚠️ More JOINs needed |

## Implementation Checklist

- [ ] Create all new normalized tables
- [ ] Add FK constraints and cascade rules
- [ ] Create appropriate indexes (tenant_id, type, date fields)
- [ ] Migrate existing data from old denormalized columns
- [ ] Update all queries to use new tables
- [ ] Update ORM/Zod schemas to reflect new structure
- [ ] Update services/repositories for new queries
- [ ] Add validation for business rules (one preferred address per type, etc.)
- [ ] Test data integrity constraints
- [ ] Update API documentation with new response shapes
- [ ] Test migration with production data subset
- [ ] Plan data migration for production (backup, test restore, cutover)

---

**Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Normalization Complete
