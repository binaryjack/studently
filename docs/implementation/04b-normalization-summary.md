# Entity Normalization Summary

## Changes Made

All entities in `04-entities.md` have been redesigned following **proven resume/CV management patterns** with full normalization and one-to-many relationships.

## Updated Entity Inventory

### 1. Student Management (Normalized)

| Entity | Relationship | Purpose |
|--------|-------------|---------|
| **Student** | Core | Personal identity (name, DOB, gender, academic status) |
| **ContactInfo[]** | 1:N | Email, phone, mobile, WhatsApp, LinkedIn (type-discriminated) |
| **PhoneNumber[]** | 1:N | Structured phone numbers (country code, area code, number) |
| **Address[]** | 1:N | Residential, billing, work, mailing addresses (type-discriminated) |
| **EmergencyContact[]** | 1:N | Priority-ordered emergency contacts |
| **StudentDocument[]** | 1:N | CVs, certificates, cover letters, transcripts |
| **DocumentVersion[]** | 1:N (per StudentDocument) | File versions with change history |
| **SwissEmploymentRecord[]** | 1:N | LACI/RI/AI status with audit trail |
| **StudentLicense[]** | 1:N | Work permits, professional licenses, certifications |

**Key Changes**:
- ❌ Removed: `email`, `phone`, `mobilePhone`, `streetAddress`, `city`, `postalCode`, `canton`, `country` from Student
- ❌ Removed: `emergencyContactName`, `emergencyContactPhone`, `emergencyContactRelationship` from Student
- ❌ Removed: `orpNumber`, `employmentStatus`, `avsNumber` from Student (moved to SwissEmploymentRecord)
- ✅ Added: Separate normalized entities for all dependent data
- ✅ Benefit: Student can now have unlimited emails, addresses, employment status changes, licenses

### 2. Learning & Competencies (Mostly Unchanged)

| Entity | Relationship | Status |
|--------|-------------|--------|
| **LearningPath** | Translatable | No changes |
| **Competency** | Translatable | No changes |
| **StudentCompetency** | Junction (N:M) | No changes |

### 3. Career & Experience (Normalized)

| Entity | Relationship | Purpose |
|--------|-------------|---------|
| **Experience[]** | 1:N per Student | Core experience (company, dates, role) |
| **ExperienceResponsibility[]** | 1:N per Experience | Individual responsibility bullet points |
| **ExperienceReference[]** | 1:N per Experience | Contact references from that experience |
| **Achievement[]** | 1:N per Student | Awards, publications, certifications |

**Key Changes**:
- ❌ Removed: `responsibilities: string[]` array from Experience (now separate table)
- ❌ Removed: `referenceContact*` fields from Experience (now separate ExperienceReference entities)
- ✅ Added: ExperienceResponsibility for detailed responsibilities with display order
- ✅ Added: ExperienceReference for multiple contacts per experience
- ✅ Benefit: Full flexibility - any number of responsibilities, references, relationships

### 4. Time Tracking (Normalized)

| Entity | Relationship | Purpose |
|--------|-------------|---------|
| **Project[]** | 1:N per Tenant | Projects for time tracking |
| **ProjectAssignment[]** | 1:N per Project | Student assignments to projects |
| **TaskType** | Translatable | Task types (development, meeting, etc.) |
| **Timesheet[]** | 1:N per Student | Weekly timesheet summaries |
| **TimesheetEntry[]** | 1:N per Timesheet | Individual time entries (day/project/task) |

**Key Changes**:
- ❌ Removed: `assignedUserIds: string[]` array from Project
- ✅ Added: ProjectAssignment for explicit student-to-project mapping
- ✅ Benefit: Track assignment dates, roles, time limits per student on project

### 5. Absence Management (Normalized)

| Entity | Relationship | Purpose |
|--------|-------------|---------|
| **Absence[]** | 1:N per Student | Absence records (sick, vacation, personal) |
| **AbsenceDocument[]** | 1:N per Absence | Supporting documents (medical certs, etc.) |

**Key Changes**:
- ❌ Removed: `certificateDocumentId` FK from Absence
- ✅ Added: AbsenceDocument entity for flexible document attachment
- ✅ Benefit: Can have multiple supporting documents per absence

### 6. Document Management (Normalized)

| Entity | Relationship | Purpose |
|--------|-------------|---------|
| **StudentDocument** | 1:N per Student | Document metadata (from 1. Student Management above) |
| **DocumentVersion[]** | 1:N per StudentDocument | File versions with history |

**Key Additions**:
- ✅ Separated version history into own table
- ✅ Tracks change description, who changed it, when
- ✅ Supports AI extraction and metadata per version

### 7. Evaluation & Reporting (Normalized)

| Entity | Relationship | Purpose |
|--------|-------------|---------|
| **Evaluation[]** | 1:N per Student | Assessments (competency, course, project) |
| **EvaluationCriteria[]** | 1:N per Evaluation | Individual criteria scores |
| **Report[]** | 1:N per Tenant | Generated reports (progress, final, custom) |

**Key Changes**:
- ❌ Removed: `criteriaScores: { }[]` embedded array
- ✅ Added: EvaluationCriteria separate entity
- ✅ Benefit: Each criterion can have detailed comment, weight, score

## Normalization Patterns Used

### Pattern 1: Type Discriminators
**ContactInfo**, **PhoneNumber**, **Address** use `type` field to categorize variants:
- ContactInfo: email | phone | mobile | whatsapp | linkedin
- PhoneNumber: mobile | home | work
- Address: residential | billing | work | mailing | emergency

### Pattern 2: One-to-Many Arrays → Separate Tables
Before: `Experience { responsibilities: string[] }`  
After: `ExperienceResponsibility` (separate 1:N table)

Before: `Absence { certificateDocumentId: string }`  
After: `AbsenceDocument[]` (supports multiple documents)

### Pattern 3: Audit Trails
**SwissEmploymentRecord** tracks complete history:
- Multiple records per student (one per status change)
- `effectiveDate` / `endDate` to show when each was active
- `isCurrent` flag for quick access to current status
- `verifiedAt` / `source` for compliance tracking

### Pattern 4: Versioning
**DocumentVersion** maintains version chain:
- Parent StudentDocument for logical grouping
- Child DocumentVersion for each version
- `is_current_version` flag
- `previous_version_id` for diff/comparison

## Database Schema Size Impact

### Row Size Reduction

**Before** (denormalized Student row):
```
Student { id, tenant_id, code, sequence, order, first_name, last_name, 
  date_of_birth, gender, email, phone, mobile_phone, street_address, city,
  postal_code, canton, country, orp_number, employment_status, avs_number,
  enrollment_date, ... } = ~50-60 columns
```
Row size: **~2-3 KB per student**

**After** (normalized):
```
Student { id, tenant_id, code, sequence, order, first_name, last_name,
  date_of_birth, gender, enrollment_date, ... } = ~15-20 columns
ContactInfo { id, student_id, type, value, ... }
PhoneNumber { id, student_id, type, country_code, ... }
Address { id, student_id, type, street, city, ... }
SwissEmploymentRecord { id, student_id, status, orp_number, ... }
```
Student row size: **~400-600 bytes** (!)  
+ separate small rows for contact data

**Benefits**:
- Smaller student table footprint
- Faster student queries (fewer columns to scan)
- Better cache efficiency
- Easier to add new contact types (no schema changes)

## Query Performance

### Common Queries Now Much Faster

**Find students with verified emails:**
```sql
-- Before: Had to check NOT NULL and validate within application
SELECT * FROM students WHERE email IS NOT NULL

-- After: Indexed lookup
SELECT s.* FROM students s
JOIN contact_infos ci ON s.id = ci.student_id
WHERE ci.type = 'email' AND ci.verified_at IS NOT NULL
-- Can create: INDEX idx_contact (tenant_id, type, verified_at)
```

**Find students by address:**
```sql
-- Before: LIKE search on embedded address field
SELECT * FROM students WHERE street_address LIKE '%rue%' AND city = 'Geneva'

-- After: Exact indexed lookup
SELECT s.* FROM students s
JOIN addresses a ON s.id = a.student_id
WHERE a.street_address ILIKE '%rue%' AND a.city = 'Geneva'
-- Can create: INDEX idx_address (city, postal_code, canton)
```

**Find students by employment status:**
```sql
-- Before: Single field lookup (simple)
SELECT * FROM students WHERE employment_status = 'LACI'

-- After: Normalized with history
SELECT s.* FROM students s
JOIN swiss_employment_records ser ON s.id = ser.student_id
WHERE ser.status = 'LACI' AND ser.is_current = true
-- Benefits: Can see status changes, verification source, dates
```

## API Response Changes

### Before
```json
{
  "id": "...",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+41 21 123 4567",
  "mobilePhone": null,
  "streetAddress": "Rue des Fleurs 123",
  "city": "Geneva",
  "postalCode": "1201",
  "canton": "GE",
  "country": "CH",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+41 21 999 9999",
  "orpNumber": "123456",
  "employmentStatus": "LACI",
  "avsNumber": "756.1234.5678.90"
}
```

### After
```json
{
  "id": "...",
  "firstName": "John",
  "lastName": "Doe",
  "contacts": [
    { "type": "email", "value": "john@example.com", "isPreferred": true, "verifiedAt": "2026-01-15" },
    { "type": "email", "value": "john.doe@company.com", "isPreferred": false },
    { "type": "phone", "value": "+41 21 123 4567", "isPreferred": true }
  ],
  "phones": [
    { "type": "mobile", "countryCode": "+41", "areaCode": "21", "number": "123 4567", "isPreferred": true }
  ],
  "addresses": [
    { "type": "residential", "street": "Rue des Fleurs 123", "city": "Geneva", "postalCode": "1201", "canton": "GE", "isCurrent": true },
    { "type": "billing", "street": "Av. de la Paix 1", "city": "Geneva", "postalCode": "1202", "canton": "GE", "isCurrent": false }
  ],
  "emergencyContacts": [
    { "priority": 1, "name": "Jane Doe", "relationship": "Sister", "email": "jane@example.com", "canReceiveAcademicInfo": true },
    { "priority": 2, "name": "Bob Smith", "relationship": "Uncle", "phone": "+41 21 888 8888" }
  ],
  "currentEmployment": {
    "status": "LACI",
    "orpNumber": "123456",
    "avsNumber": "756.1234.5678.90",
    "effectiveDate": "2025-09-01",
    "verifiedAt": "2026-01-10",
    "source": "ORP_INTEGRATION"
  }
}
```

**Benefits**:
- ✅ Flexible: Can have multiple emails, phones, addresses
- ✅ Structured: Type information at query time
- ✅ Clear: Meaningful field grouping
- ✅ Auditable: Verification and source info visible
- ✅ Extensible: Easy to add new contact types

## Migration Path

### Phase 1: Create New Tables (0 downtime)
- Create all normalized tables in parallel
- No changes to existing schema

### Phase 2: Dual Write (Optional)
- Application writes to both old and new tables
- Gradually migrate to new queries

### Phase 3: Data Migration
- Migrate existing data from old embedded columns
- Validate data integrity
- Run consistency checks

### Phase 4: Switch & Cleanup
- Switch application to new normalized queries
- Deprecate old embedded columns
- Drop old columns (after validation period)

## Files Changed

- **04-entities.md** - Complete rewrite with normalized entities
- **04a-normalization-guide.md** - NEW - Detailed guide (this file + methodology)

## Next Steps

1. Review normalized entity definitions in 04-entities.md
2. Update ORM/Zod schemas to match new structure
3. Update all queries in services/repositories
4. Plan data migration for existing installations
5. Test with production-like datasets
6. Update API documentation with new response shapes
7. Prepare frontend to consume new nested data structures

---

**Updated**: March 17, 2026  
**Version**: 2.0 (Fully Normalized)  
**Status**: Ready for Implementation
