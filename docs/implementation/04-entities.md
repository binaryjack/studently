# Core Entities & Domain Model (Normalized)

## Overview
This document defines all core entities in the Studently platform using **fully normalized design**. Each entity is focused on a single responsibility, with one-to-many relationships handling related data (addresses, phone numbers, contacts, etc.). This follows database normalization best practices and the structure patterns from proven resume/CV management systems.

Each entity follows the base interface patterns defined in [01-base-interfaces.md](01-base-interfaces.md) and implements Feature Slice Design architecture.

## Core Principle: Normalization

Instead of embedding data directly in entities:
- ❌ `Student { firstName, lastName, email, phone, mobilePhone, streetAddress, city, ... }`

We use separate, normalized tables:
- ✅ `Student { firstName, lastName }` (core identity)
- ✅ `ContactInfo[]` → `{ type: 'email'|'phone'|'mobile', value, isPreferred }`
- ✅ `Address[]` → `{ type: 'residential'|'billing'|'work', street, city, ... }`
- ✅ `PhoneNumber[]` → `{ type: 'mobile'|'home'|'work', countryCode, number, isPreferred }`

Benefits:
- Single source of truth (user can have multiple emails/phones)
- Flexible versioning (track when contact info changed)
- Better query performance (index by type)
- Type safety (each entity has specific, simple properties)
- Audit trail (who changed what, when)

## Entity Categories

### 1. Student Management (Core)
- **Student** (core identity)
- **ContactInfo** (email, phone types - one-to-many)
- **PhoneNumber** (structured phone - one-to-many)
- **Address** (residential, billing, work - one-to-many)
- **EmergencyContact** (one-to-many)
- **StudentDocument** (CVs, cover letters, etc. - one-to-many)

### 2. Student Employment Record (Swiss-specific)
- **SwissEmploymentRecord** (LACI/RI/AI status with audit trail)
- **StudentLicense** (work permits, certifications - one-to-many)

### 3. Learning & Competencies
- **LearningPath** (translatable course program)
- **Competency** (skill definition - translatable)
- **CompetencyCategory** (grouping)
- **StudentCompetency** (junction - student's level for a competency)

### 4. Career & Experience
- **Experience** (work/internship/volunteer - one-to-many per student)
- **ExperienceType** (category lookup)
- **Achievement** (awards, certifications - one-to-many)
- **AchievementType** (category lookup)

### 5. Time Tracking
- **Project** (client project - one-to-many)
- **ProjectCategory** (lookup)
- **TaskType** (lookup)
- **Timesheet** (weekly summary - one-to-many)
- **TimesheetEntry** (daily entry - one-to-many per timesheet)

### 6. Absence Management
- **Absence** (one-to-many per student)
- **AbsenceType** (lookup)
- **AbsenceReason** (lookup)

### 7. Document Management
- **DocumentVersion** (versioned document - one-to-many)
- **DocumentCategory** (lookup)

### 8. Evaluation & Reporting
- **Evaluation** (one-to-many per student)
- **EvaluationCriteria** (lookup)
- **Report** (one-to-many per student)
- **ReportTemplate** (lookup)

## Detailed Entity Definitions

### 1. Student Management (Normalized)

#### Student (Core Identity)

```typescript
import { BaseEntity, FlaggedEntity } from '../base-interfaces';

/**
 * Core student entity - minimal, focused on identity
 * Related data (contact, addresses, etc.) are in separate normalized tables
 */
export interface Student extends BaseEntity, FlaggedEntity {
  // Core Identity
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601 date
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Academic Information
  enrollmentDate: string; // ISO 8601 date
  expectedGraduationDate?: string; // ISO 8601 date
  currentLearningPathCode?: string; // Foreign key to LearningPath
  currentStatus: 'ENROLLED' | 'ACTIVE' | 'ON_LEAVE' | 'GRADUATED' | 'DROPPED' | 'SUSPENDED';
  
  // Profile Image
  profileImageUrl?: string;
  
  // Notes
  notes?: string;
}
```

**Database Schema:**

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  -- Core Identity
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(50),
  
  -- Academic
  enrollment_date DATE NOT NULL,
  expected_graduation_date DATE,
  current_learning_path_code VARCHAR(255),
  current_status VARCHAR(50) NOT NULL DEFAULT 'ENROLLED',
  
  -- Profile
  profile_image_url TEXT,
  notes TEXT,
  
  -- Flags
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, code),
  INDEX idx_students_tenant (tenant_id),
  INDEX idx_students_sequence (tenant_id, sequence),
  INDEX idx_students_status (tenant_id, current_status),
  INDEX idx_students_learning_path (tenant_id, current_learning_path_code)
);
```

#### ContactInfo (One-to-Many)

```typescript
/**
 * Normalized contact information (email, phone, mobile, fax, etc.)
 * One student can have multiple contact entries
 */
export interface ContactInfo extends BaseEntity {
  studentId: string; // Foreign key to Student
  type: 'email' | 'phone' | 'mobile' | 'fax' | 'whatsapp' | 'telegram' | 'linkedin' | 'other';
  value: string;
  label?: string; // e.g., "Work", "Personal", "Emergency"
  isPreferred: boolean; // Primary contact method for this type
  isPublic: boolean; // Can be shared with others (e.g., for peer communication)
  verifiedAt?: string; // When email/phone was verified
  verificationToken?: string; // For pending verification
}
```

**Database Schema:**

```sql
CREATE TABLE contact_infos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  type VARCHAR(50) NOT NULL,
  value VARCHAR(500) NOT NULL,
  label VARCHAR(100),
  is_preferred BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  verification_token VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, type, value),
  INDEX idx_contact_infos_student (tenant_id, student_id),
  INDEX idx_contact_infos_type (tenant_id, type),
  INDEX idx_contact_infos_value (tenant_id, value),
  INDEX idx_contact_infos_verified (tenant_id, verified_at)
);
```

#### PhoneNumber (One-to-Many - Structured)

```typescript
/**
 * Normalized, structured phone number
 * Separate entity for better query performance and international support
 */
export interface PhoneNumber extends BaseEntity {
  studentId: string; // Foreign key to Student
  type: 'mobile' | 'home' | 'work' | 'other';
  countryCode: string; // e.g., "+41", "+1", "+33"
  areaCode?: string; // e.g., "21" for Swiss Zug
  number: string; // Without country/area codes
  extension?: string; // For office phones
  label?: string; // e.g., "Mom's phone", "Office main line"
  isPreferred: boolean;
  canReceiveSms: boolean;
  canReceiveWhatsapp: boolean;
}
```

**Database Schema:**

```sql
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  type VARCHAR(50) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  area_code VARCHAR(10),
  number VARCHAR(20) NOT NULL,
  extension VARCHAR(10),
  label VARCHAR(100),
  is_preferred BOOLEAN DEFAULT false,
  can_receive_sms BOOLEAN DEFAULT true,
  can_receive_whatsapp BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  INDEX idx_phone_numbers_student (tenant_id, student_id),
  INDEX idx_phone_numbers_type (tenant_id, type),
  INDEX idx_phone_numbers_full (country_code, area_code, number)
);
```

#### Address (One-to-Many)

```typescript
/**
 * Normalized addresses (residential, billing, work, etc.)
 * One student can have multiple addresses (home, billing, work, emergency, etc.)
 */
export interface Address extends BaseEntity {
  studentId: string; // Foreign key to Student
  type: 'residential' | 'billing' | 'work' | 'emergency' | 'mailing' | 'other';
  label?: string; // Free-form label for user organization
  
  // Address Components
  streetAddress: string; // Street and building number
  streetAddress2?: string; // Apartment, suite, etc.
  city: string;
  postalCode: string;
  canton?: string; // Swiss canton code (AG, ZH, etc.)
  country: string; // ISO 3166-1 alpha-2
  
  // Coordinates (optional, for maps)
  latitude?: number;
  longitude?: number;
  
  // Flags
  isPreferred: boolean; // Default address for this type
  isCurrent: boolean; // Currently living at this address
  
  // Period of residence
  moveInDate?: string; // When student moved to this address
  moveOutDate?: string; // When student moved out (null if current)
}
```

**Database Schema:**

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  type VARCHAR(50) NOT NULL,
  label VARCHAR(100),
  
  street_address VARCHAR(255) NOT NULL,
  street_address2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  canton VARCHAR(50),
  country VARCHAR(2) NOT NULL,
  
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  is_preferred BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT true,
  
  move_in_date DATE,
  move_out_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, type, move_in_date),
  INDEX idx_addresses_student (tenant_id, student_id),
  INDEX idx_addresses_type (tenant_id, type),
  INDEX idx_addresses_current (tenant_id, is_current),
  INDEX idx_addresses_location (tenant_id, city, postal_code)
);
```

#### EmergencyContact (One-to-Many)

```typescript
/**
 * Normalized emergency contacts
 * One student can have multiple emergency contacts (primary, secondary, tertiary, etc.)
 */
export interface EmergencyContact extends BaseEntity {
  studentId: string; // Foreign key to Student
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest priority
  
  name: string;
  relationship: string; // "Mother", "Brother", "Friend", etc.
  
  // Contact info
  phoneNumberId?: string; // Foreign key to PhoneNumber (preferred contact)
  alternatePhone?: string;
  email?: string;
  
  // Authorization
  canReceiveAcademicInfo: boolean; // Can share grades, progress
  canReceiveFinancialInfo: boolean; // Can discuss fees, payments
  canAuthorizeAbsence: boolean; // Can approve student absences
}
```

**Database Schema:**

```sql
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  priority SMALLINT NOT NULL CHECK (priority >= 1 AND priority <= 5),
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  
  phone_number_id UUID REFERENCES phone_numbers(id),
  alternate_phone VARCHAR(50),
  email VARCHAR(255),
  
  can_receive_academic_info BOOLEAN DEFAULT false,
  can_receive_financial_info BOOLEAN DEFAULT false,
  can_authorize_absence BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  INDEX idx_emergency_contacts_student (tenant_id, student_id),
  INDEX idx_emergency_contacts_priority (tenant_id, priority)
);
```

#### StudentDocument (One-to-Many)

```typescript
/**
 * Versioned documents attached to student (CV, certificates, etc.)
 * One student can have multiple documents, each with multiple versions
 */
export interface StudentDocument extends BaseEntity, FlaggedEntity {
  studentId: string; // Foreign key to Student
  documentCategoryCode: string; // 'cv', 'cover-letter', 'certificate', 'license', 'transcript', etc.
  
  title: string;
  description?: string;
  
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  
  // Versioning
  version: number;
  isLatestVersion: boolean;
  previousVersionId?: string;
  
  // Metadata
  tags?: string[]; // For search/categorization
  language?: string; // ISO 639-1
  
  // Dates
  documentDate?: string; // Date of document content (e.g., certificate issue date)
  expiryDate?: string; // For certificates with expiry
  
  // AI-extracted data
  extractedText?: string; // OCR or PDF extraction
  extractedMetadata?: Record<string, any>; // AI-extracted structured data
  
  // Approval workflow
  workflowExecutionId?: string; // Link to workflow if document requires approval
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
}
```

**Database Schema:**

```sql
CREATE TABLE student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  document_category_code VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  
  version INTEGER NOT NULL DEFAULT 1,
  is_latest_version BOOLEAN NOT NULL DEFAULT true,
  previous_version_id UUID REFERENCES student_documents(id),
  
  tags TEXT[],
  language VARCHAR(10),
  
  document_date DATE,
  expiry_date DATE,
  
  extracted_text TEXT,
  extracted_metadata JSONB,
  
  workflow_execution_id UUID,
  approval_status VARCHAR(50) DEFAULT 'NOT_REQUIRED',
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, code, version),
  INDEX idx_student_documents_student (tenant_id, student_id),
  INDEX idx_student_documents_category (tenant_id, document_category_code),
  INDEX idx_student_documents_latest (tenant_id, student_id, is_latest_version),
  INDEX idx_student_documents_expiry (tenant_id, expiry_date)
);
```

### 2. Student Employment Record (Swiss-specific)

#### SwissEmploymentRecord (One-to-Many per Student)

```typescript
/**
 * Tracks student's Swiss employment status (LACI, RI, AI, etc.)
 * One student can have multiple records as status changes over time (audit trail)
 */
export interface SwissEmploymentRecord extends BaseEntity {
  studentId: string; // Foreign key to Student
  
  // Employment Status Type
  status: 'LACI' | 'RI' | 'AI' | 'EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'OTHER';
  
  // Status-Specific References
  orpNumber?: string; // Swiss unemployment office (ORP) number, required for LACI/RI
  laciReferenceNumber?: string; // LACI case reference
  riCaseNumber?: string; // RI case number
  aiReferenceNumber?: string; // AI case number
  
  // Swiss Social Security Numbers (AVS/AHV)
  avsNumber?: string; // Format: 756.XXXX.XXXX.XX
  
  // Work Permit
  workPermit?: 'B' | 'C' | 'G' | 'L' | 'N' | 'S' | 'NONE';
  workPermitExpiryDate?: string; // ISO 8601
  
  // Period this record is active
  effectiveDate: string; // When this status became effective
  endDate?: string; // When this status ended (null if current)
  isCurrent: boolean; // Is this the current employment status
  
  // Unemployment Benefits Tracking
  unemploymentIndemnityChf?: number; // Amount in CHF per period
  unemploymentBenefitsStartDate?: string; // ISO 8601
  unemploymentBenefitsEndDate?: string; // ISO 8601
  benefitsPeriodWeeks?: number; // Remaining weeks of benefits
  
  // Compliance Info
  complianceStatus?: 'COMPLIANT' | 'AT_RISK' | 'NON_COMPLIANT' | 'ARCHIVED';
  lastComplianceCheckDate?: string;
  complianceNotes?: string;
  
  // Record Management
  verifiedByUserId?: string; // Who verified this status
  verifiedAt?: string; // When it was verified
  source?: 'MANUAL_ENTRY' | 'ORP_INTEGRATION' | 'STUDENT_SELF_REPORT' | 'DOCUMENT_UPLOAD' | 'IMPORT';
  sourceDocumentId?: string; // Link to supporting document
}
```

**Database Schema:**

```sql
CREATE TABLE swiss_employment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  status VARCHAR(50) NOT NULL,
  
  orp_number VARCHAR(50),
  laci_reference_number VARCHAR(100),
  ri_case_number VARCHAR(100),
  ai_reference_number VARCHAR(100),
  
  avs_number VARCHAR(20),
  
  work_permit VARCHAR(10),
  work_permit_expiry_date DATE,
  
  effective_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  
  unemployment_indemnity_chf DECIMAL(10, 2),
  unemployment_benefits_start_date DATE,
  unemployment_benefits_end_date DATE,
  benefits_period_weeks INTEGER,
  
  compliance_status VARCHAR(50),
  last_compliance_check_date TIMESTAMP,
  compliance_notes TEXT,
  
  verified_by_user_id UUID,
  verified_at TIMESTAMP,
  source VARCHAR(50) DEFAULT 'MANUAL_ENTRY',
  source_document_id UUID,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, effective_date),
  INDEX idx_swiss_employment_student (tenant_id, student_id),
  INDEX idx_swiss_employment_current (tenant_id, student_id, is_current),
  INDEX idx_swiss_employment_status (tenant_id, status),
  INDEX idx_swiss_employment_orp (tenant_id, orp_number),
  INDEX idx_swiss_employment_avs (tenant_id, avs_number),
  INDEX idx_swiss_employment_compliance (tenant_id, compliance_status)
);
```

#### StudentLicense (One-to-Many)

```typescript
/**
 * Student licenses, certifications, permits
 * Work permits, professional licenses, certifications (separate from documents)
 */
export interface StudentLicense extends BaseEntity, FlaggedEntity {
  studentId: string; // Foreign key to Student
  licenseType: string; // 'work_permit_b', 'driving_license', 'forklift_cert', etc.
  
  licenseNumber: string; // Official license/permit number
  issuer: string; // Organization that issued (canton, federal office, etc.)
  
  issuedDate: string; // ISO 8601
  expiryDate?: string; // ISO 8601 (null if no expiry)
  
  isExpired: boolean; // Cached field, updated periodically
  daysUntilExpiry?: number; // For warning/notification
  
  verificationUrl?: string; // URL to verify (e.g., official registry)
  documentId?: string; // Link to supporting document
}
```

**Database Schema:**

```sql
CREATE TABLE student_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  license_type VARCHAR(100) NOT NULL,
  license_number VARCHAR(100) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  
  issued_date DATE NOT NULL,
  expiry_date DATE,
  
  is_expired BOOLEAN DEFAULT false,
  days_until_expiry INTEGER,
  
  verification_url TEXT,
  document_id UUID,
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, license_number),
  INDEX idx_student_licenses_student (tenant_id, student_id),
  INDEX idx_student_licenses_type (tenant_id, license_type),
  INDEX idx_student_licenses_expiry (tenant_id, expiry_date)
);
```

### 3. Learning & Competencies

#### LearningPath

```typescript
import { TranslatableEntity, FlaggedEntity } from '../base-interfaces';

/**
 * Learning path/program entity (translatable)
 */
export interface LearningPath extends TranslatableEntity, FlaggedEntity {
  // Inherits: id, sequence, code, order, language, name, description
  // Inherits: isSelected, isActive
  
  categoryCode: string; // 'software-dev', 'business-admin', etc.
  
  durationHours: number; // Estimated duration
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Prerequisites
  prerequisiteCodes?: string[]; // Codes of required learning paths
  
  // Competencies
  competencyCodes: string[]; // Codes of competencies taught
  
  // Pricing (optional)
  priceChf?: number; // Swiss Francs
  
  // Visibility
  isPublished: boolean;
  publishedAt?: string; // ISO 8601
  
  // Enrollment
  maxStudents?: number;
  currentEnrollmentCount: number;
  
  // Metadata
  imageUrl?: string;
  syllabusPdfUrl?: string;
}
```

**Database Schema:**

```sql
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  language VARCHAR(2) NOT NULL,
  
  category_code VARCHAR(255) NOT NULL,
  duration_hours INTEGER NOT NULL,
  level VARCHAR(50) NOT NULL,
  prerequisite_codes TEXT[], -- Array of codes
  competency_codes TEXT[] NOT NULL,
  
  price_chf DECIMAL(10, 2),
  
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  
  max_students INTEGER,
  current_enrollment_count INTEGER DEFAULT 0,
  
  image_url TEXT,
  syllabus_pdf_url TEXT,
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, code),
  INDEX idx_learning_paths_tenant (tenant_id),
  INDEX idx_learning_paths_category (tenant_id, category_code),
  INDEX idx_learning_paths_level (tenant_id, level)
);

-- Translations stored in central translations table
INSERT INTO translations (tenant_id, entity_type, code, language, name, description)
VALUES ('tenant-uuid', 'learning-path', 'software-dev-bootcamp', 'en', 'Software Development Bootcamp', 'Full-stack...');
```

#### Competency

```typescript
/**
 * Skill/competency entity (translatable)
 */
export interface Competency extends TranslatableEntity, FlaggedEntity {
  categoryCode: string; // 'technical', 'soft-skills', 'languages', etc.
  
  // Competency type
  type: 'TECHNICAL' | 'SOFT_SKILL' | 'LANGUAGE' | 'CERTIFICATION' | 'OTHER';
  
  // Proficiency levels
  levels: {
    code: string; // 'beginner', 'intermediate', 'advanced', 'expert'
    description: string; // Level description
  }[];
  
  // Assessment
  isAssessable: boolean;
  assessmentCriteriaCode?: string;
  
  // Industry standard references
  externalStandardCode?: string; // e.g., 'CEFR-B2' for languages
  
  // Icon/visual
  iconUrl?: string;
}
```

#### StudentCompetency (Junction Table)

```typescript
/**
 * Student's acquired competencies with proficiency tracking
 */
export interface StudentCompetency extends BaseEntity {
  studentId: string;
  competencyCode: string;
  
  currentLevel: string; // 'beginner', 'intermediate', etc.
  targetLevel?: string; // Goal level
  
  acquiredDate: string; // ISO 8601
  lastAssessedDate?: string; // ISO 8601
  nextAssessmentDate?: string; // ISO 8601
  
  assessorUserId?: string;
  assessmentScore?: number; // 0-100
  assessmentNotes?: string;
  
  // Evidence
  evidenceDocumentIds?: string[]; // Links to documents
  
  // Progress
  progressPercentage: number; // 0-100
  hoursInvested: number;
}
```

### 4. Career & Experience (Normalized - One-to-Many)

#### Experience

```typescript
/**
 * Work experience, internships, volunteer work (one-to-many per student)
 */
export interface Experience extends BaseEntity, FlaggedEntity {
  studentId: string; // Foreign key to Student
  
  typeCode: string; // 'work', 'internship', 'volunteer', 'apprenticeship'
  
  title: string; // Job title
  company: string; // Company/organization name
  location?: string; // City/canton
  
  startDate: string; // ISO 8601
  endDate?: string; // Null if current position
  isCurrent: boolean;
  
  // Competencies gained
  competencyCodes?: string[]; // Foreign keys to Competency
  
  // Visibility
  includeInCv: boolean;
  displayOrder?: number; // For CV ordering
}
```

**Database Schema:**

```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  type_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  
  competency_codes TEXT[],
  
  include_in_cv BOOLEAN DEFAULT true,
  display_order INTEGER,
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, code),
  INDEX idx_experiences_student (tenant_id, student_id),
  INDEX idx_experiences_type (tenant_id, type_code),
  INDEX idx_experiences_dates (start_date, end_date)
);
```

#### ExperienceResponsibility (One-to-Many per Experience)

```typescript
/**
 * Detailed responsibilities for an experience (one-to-many per experience)
 * Separate entity allows versioning and detailed tracking
 */
export interface ExperienceResponsibility extends BaseEntity {
  experienceId: string; // Foreign key to Experience
  
  responsibility: string; // Text description
  displayOrder: number; // For ordering in UI/CV
}
```

**Database Schema:**

```sql
CREATE TABLE experience_responsibilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  responsibility TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  INDEX idx_experience_responsibilities (tenant_id, experience_id)
);
```

#### ExperienceReference (One-to-Many per Experience)

```typescript
/**
 * References/contacts from an experience
 * Separate entity for flexibility (can have multiple references per job)
 */
export interface ExperienceReference extends BaseEntity {
  experienceId: string; // Foreign key to Experience
  
  contactName: string;
  jobTitle?: string; // Their position at the company
  email?: string;
  phone?: string;
  relationship?: string; // 'manager', 'colleague', 'mentor', 'hr_contact'
}
```

**Database Schema:**

```sql
CREATE TABLE experience_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  contact_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  relationship VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  INDEX idx_experience_references (tenant_id, experience_id)
);
```

#### Achievement (One-to-Many per Student)

```typescript
/**
 * Awards, recognitions, publications, certifications (one-to-many per student)
 */
export interface Achievement extends BaseEntity, FlaggedEntity {
  studentId: string; // Foreign key to Student
  
  typeCode: string; // 'award', 'publication', 'competition', 'certification', 'badge'
  
  title: string;
  issuer: string; // Organization, journal, competition name
  description?: string;
  
  achievementDate: string; // ISO 8601
  expiryDate?: string; // For time-limited certifications
  
  // Verification
  verificationUrl?: string; // Badge link, publication DOI, official certificate register
  
  // Visibility
  includeInCv: boolean;
  displayOrder?: number;
}
```

**Database Schema:**

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  type_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  description TEXT,
  
  achievement_date DATE NOT NULL,
  expiry_date DATE,
  
  verification_url TEXT,
  
  include_in_cv BOOLEAN DEFAULT true,
  display_order INTEGER,
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, code),
  INDEX idx_achievements_student (tenant_id, student_id),
  INDEX idx_achievements_type (tenant_id, type_code),
  INDEX idx_achievements_expiry (tenant_id, expiry_date)
);
```

### 5. Time Tracking (Normalized)

#### Project (One-to-Many)

```typescript
/**
 * Projects for time tracking
 */
export interface Project extends TranslatableEntity, FlaggedEntity {
  // Inherits: id, sequence, code, order, language, name, description
  categoryCode: string; // 'client-work', 'internal', 'training', etc.
  
  // Client (separate normalized entity can reference client_id instead)
  clientName?: string;
  
  // Dates
  startDate: string; // ISO 8601
  endDate?: string;
  deadline?: string;
  
  // Budget
  estimatedHours?: number;
  budgetChf?: number;
  
  // Status
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  managerUserId?: string;
  
  // Billing
  isBillable: boolean;
  hourlyRateChf?: number;
}
```

**Database Schema:**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  language VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  category_code VARCHAR(100) NOT NULL,
  client_name VARCHAR(255),
  
  start_date DATE NOT NULL,
  end_date DATE,
  deadline DATE,
  
  estimated_hours DECIMAL(10, 2),
  budget_chf DECIMAL(12, 2),
  
  status VARCHAR(50) NOT NULL DEFAULT 'PLANNING',
  manager_user_id UUID,
  
  is_billable BOOLEAN DEFAULT false,
  hourly_rate_chf DECIMAL(10, 2),
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, code, language),
  INDEX idx_projects_tenant (tenant_id),
  INDEX idx_projects_status (tenant_id, status),
  INDEX idx_projects_dates (start_date, end_date)
);
```

#### ProjectAssignment (One-to-Many per Project)

```typescript
/**
 * Student assignments to projects
 * Tracks who can log time against which projects
 */
export interface ProjectAssignment extends BaseEntity {
  projectId: string; // Foreign key to Project
  studentId: string; // Foreign key to Student
  
  assignedDate: string; // ISO 8601
  unassignedDate?: string; // When removed from project
  isActive: boolean; // Currently assigned
  
  // Role on project
  role?: string; // 'team-member', 'lead', 'manager'
  
  // Time tracking limits
  maxHoursPerWeek?: number; // Optional limit
}
```

**Database Schema:**

```sql
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  assigned_date DATE NOT NULL,
  unassigned_date DATE,
  is_active BOOLEAN DEFAULT true,
  
  role VARCHAR(50),
  max_hours_per_week DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, project_id, student_id, assigned_date),
  INDEX idx_project_assignments_student (tenant_id, student_id),
  INDEX idx_project_assignments_project (tenant_id, project_id)
);
```

#### TaskType (Translatable, One-to-Many)

```typescript
/**
 * Types of tasks for time tracking (translatable)
 */
export interface TaskType extends TranslatableEntity, FlaggedEntity {
  // Examples: 'development', 'design', 'meeting', 'documentation', 'testing'
  
  categoryCode: string; // 'productive', 'administrative', 'training'
  
  // Default billing
  isBillableByDefault: boolean;
  defaultHourlyRateChf?: number;
  
  // UI metadata
  colorHex?: string;
  iconName?: string;
}
```

#### Timesheet (One-to-Many per Student)

```typescript
/**
 * Weekly timesheet summary
 */
export interface Timesheet extends BaseEntity, FlaggedEntity {
  studentId: string; // Foreign key to Student
  
  // Week identification
  year: number;
  weekNumber: number; // ISO week number (1-53)
  weekStartDate: string; // Monday (ISO 8601)
  weekEndDate: string; // Sunday (ISO 8601)
  
  // Totals (denormalized for quick access)
  totalHours: number; // Sum of all entries
  totalBillableHours: number;
  totalNonBillableHours: number;
  
  // Status
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt?: string; // ISO 8601
  approvedAt?: string; // ISO 8601
  approvedByUserId?: string;
  rejectionReason?: string;
  
  // Workflow
  workflowExecutionId?: string; // Link to approval workflow
  
  // Notes
  notes?: string;
}
```

**Database Schema:**

```sql
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  year SMALLINT NOT NULL,
  week_number SMALLINT NOT NULL CHECK (week_number >= 1 AND week_number <= 53),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  total_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_billable_hours DECIMAL(10, 2) DEFAULT 0,
  total_non_billable_hours DECIMAL(10, 2) DEFAULT 0,
  
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by_user_id UUID,
  rejection_reason TEXT,
  
  workflow_execution_id UUID,
  notes TEXT,
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, year, week_number),
  INDEX idx_timesheets_student (tenant_id, student_id),
  INDEX idx_timesheets_status (tenant_id, status),
  INDEX idx_timesheets_dates (week_start_date, week_end_date)
);
```

#### TimesheetEntry (One-to-Many per Timesheet)

```typescript
/**
 * Individual time entry within a timesheet
 * Highly normalized: one entry per day/project/task combination
 */
export interface TimesheetEntry extends BaseEntity {
  timesheetId: string; // Foreign key to Timesheet
  studentId: string; // Denormalized for faster queries
  
  // Date
  date: string; // ISO 8601 date
  
  // Time
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  durationMinutes: number; // Auto-calculated
  
  // Classification
  projectCode: string; // Foreign key to Project
  taskTypeCode: string; // Foreign key to TaskType
  
  // Description
  description?: string;
  
  // Billing
  isBillable: boolean;
  hourlyRateChf?: number; // Override if different from project
}
```

**Database Schema:**

```sql
CREATE TABLE timesheet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  project_code VARCHAR(255) NOT NULL,
  task_type_code VARCHAR(255) NOT NULL,
  
  description TEXT,
  
  is_billable BOOLEAN NOT NULL DEFAULT false,
  hourly_rate_chf DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, timesheet_id, date, project_code, task_type_code),
  INDEX idx_timesheet_entries_timesheet (tenant_id, timesheet_id),
  INDEX idx_timesheet_entries_date (tenant_id, date),
  INDEX idx_timesheet_entries_project (tenant_id, project_code)
);
```

### 6. Absence Management (Normalized - One-to-Many)

#### Absence

```typescript
/**
 * Student absence record (one-to-many per student)
 */
export interface Absence extends BaseEntity, FlaggedEntity {
  studentId: string; // Foreign key to Student
  
  absenceTypeCode: string; // 'sick', 'vacation', 'personal', 'training'
  absenceReasonCode?: string; // More specific reason
  
  // Dates
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  isPartialDay: boolean;
  partialDayHours?: number; // If partial (e.g., 4 hours out of 8)
  
  totalDays: number; // Business days count
  
  // Justification
  justification?: string;
  
  // Status
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedByUserId?: string;
  approvedAt?: string; // ISO 8601
  rejectionReason?: string;
  
  // Workflow
  workflowExecutionId?: string;
  
  // Notification
  notificationMethod?: 'EMAIL' | 'SMS' | 'BOTH';
}
```

**Database Schema:**

```sql
CREATE TABLE absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  absence_type_code VARCHAR(50) NOT NULL,
  absence_reason_code VARCHAR(100),
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_partial_day BOOLEAN DEFAULT false,
  partial_day_hours DECIMAL(5, 2),
  
  total_days DECIMAL(10, 2),
  
  justification TEXT,
  
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  approved_by_user_id UUID,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  workflow_execution_id UUID,
  notification_method VARCHAR(50),
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, code),
  INDEX idx_absences_student (tenant_id, student_id),
  INDEX idx_absences_type (tenant_id, absence_type_code),
  INDEX idx_absences_dates (start_date, end_date)
);
```

#### AbsenceDocument (One-to-Many per Absence)

```typescript
/**
 * Supporting documents for absences (medical certificates, etc.)
 */
export interface AbsenceDocument extends BaseEntity {
  absenceId: string; // Foreign key to Absence
  documentId?: string; // Foreign key to StudentDocument (if stored as doc version)
  
  documentType: 'medical-certificate' | 'justification-letter' | 'approval-form' | 'other';
  
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  
  uploadedDate: string; // ISO 8601
}
```

**Database Schema:**

```sql
CREATE TABLE absence_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  absence_id UUID NOT NULL REFERENCES absences(id) ON DELETE CASCADE,
  document_id UUID,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  
  uploaded_date TIMESTAMP NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  INDEX idx_absence_documents (tenant_id, absence_id)
);
```

### 8. Document Management

#### DocumentVersion (One-to-Many per StudentDocument)

```typescript
/**
 * Document version history (one-to-many per StudentDocument)
 * Each version is separate for audit trail and easy comparison
 */
export interface DocumentVersion extends BaseEntity {
  documentId: string; // Foreign key to StudentDocument
  
  version: number; // 1, 2, 3, etc.
  
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  
  // Changes
  changeDescription?: string;
  changedByUserId: string;
  
  // AI processing
  aiProcessedAt?: string; // ISO 8601
  aiExtractedData?: Record<string, any>;
  aiSummary?: string;
  
  // Status
  isCurrentVersion: boolean;
}
```

**Database Schema:**

```sql
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES student_documents(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  version INTEGER NOT NULL,
  
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  
  change_description TEXT,
  changed_by_user_id UUID NOT NULL,
  
  ai_processed_at TIMESTAMP,
  ai_extracted_data JSONB,
  ai_summary TEXT,
  
  is_current_version BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, document_id, version),
  INDEX idx_document_versions_document (tenant_id, document_id),
  INDEX idx_document_versions_current (tenant_id, is_current_version)
);
```

### 9. Evaluation & Reporting (Normalized - One-to-Many)

#### Evaluation

```typescript
/**
 * Student evaluation/assessment (one-to-many per student)
 */
export interface Evaluation extends BaseEntity, FlaggedEntity {
  studentId: string; // Foreign key to Student
  evaluatorUserId: string; // Foreign key to User
  
  evaluationType: 'COMPETENCY' | 'COURSE' | 'PROJECT' | 'OVERALL';
  subjectCode?: string; // Competency code, course code, project code, etc.
  
  // Period
  evaluationDate: string; // ISO 8601
  period?: string; // 'Q1-2026', 'Semester-1', etc.
  
  // Scores
  overallScore?: number; // 0-100
  gradeLetterOrNumber?: string; // 'A', 'B+', '5.5', etc.
  
  // Feedback
  strengths?: string;
  areasForImprovement?: string;
  comments?: string;
  nextSteps?: string[]; // JSON array
  
  // Goals & Plans
  improvementPlanId?: string; // Link to improvement plan if needed
  
  // Status
  status: 'DRAFT' | 'COMPLETED' | 'REVIEWED';
  
  // Visibility
  sharedWithStudent: boolean;
  studentAcknowledgedAt?: string; // ISO 8601
}
```

**Database Schema:**

```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  evaluator_user_id UUID NOT NULL,
  evaluation_type VARCHAR(50) NOT NULL,
  subject_code VARCHAR(255),
  
  evaluation_date DATE NOT NULL,
  period VARCHAR(50),
  
  overall_score DECIMAL(5, 2),
  grade_letter_or_number VARCHAR(10),
  
  strengths TEXT,
  areas_for_improvement TEXT,
  comments TEXT,
  next_steps TEXT[],
  
  improvement_plan_id UUID,
  
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  
  shared_with_student BOOLEAN DEFAULT false,
  student_acknowledged_at TIMESTAMP,
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, student_id, code),
  INDEX idx_evaluations_student (tenant_id, student_id),
  INDEX idx_evaluations_date (evaluation_date),
  INDEX idx_evaluations_type (tenant_id, evaluation_type)
);
```

#### EvaluationCriteria (One-to-Many per Evaluation)

```typescript
/**
 * Individual criteria scores within an evaluation
 */
export interface EvaluationCriteria extends BaseEntity {
  evaluationId: string; // Foreign key to Evaluation
  
  criteriaCode: string; // Reference to predefined criteria
  score: number; // 0-100 or scaled score
  weight: number; // Weight in final calculation (0-1)
  
  comment?: string; // Specific feedback for this criterion
}
```

**Database Schema:**

```sql
CREATE TABLE evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  criteria_code VARCHAR(255) NOT NULL,
  score DECIMAL(5, 2) NOT NULL,
  weight DECIMAL(3, 2) NOT NULL,
  
  comment TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  INDEX idx_evaluation_criteria (tenant_id, evaluation_id)
);
```

#### Report

```typescript
/**
 * Generated reports (progress, final, custom, cohort, etc.)
 * One-to-many per student/learning path
 */
export interface Report extends BaseEntity, FlaggedEntity {
  reportTemplateCode: string; // 'progress-report', 'final-report', etc.
  
  // Subject
  studentId?: string; // If student-specific report
  learningPathCode?: string; // If cohort/program report
  
  // Period
  reportPeriodStart: string; // ISO 8601
  reportPeriodEnd: string; // ISO 8601
  generatedAt: string; // ISO 8601
  generatedByUserId: string;
  
  // Data
  reportData: Record<string, any>; // Structured JSON data
  
  // Output files
  pdfUrl?: string;
  htmlUrl?: string;
  
  // AI assistance
  aiGeneratedSummary?: string;
  aiGeneratedRecommendations?: string[]; // JSON array
  
  // Distribution
  sentToStudentAt?: string; // ISO 8601
  acknowledgedByStudentAt?: string; // ISO 8601
}
```

**Database Schema:**

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  
  report_template_code VARCHAR(255) NOT NULL,
  
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  learning_path_code VARCHAR(255),
  
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  generated_by_user_id UUID NOT NULL,
  
  report_data JSONB NOT NULL,
  
  pdf_url TEXT,
  html_url TEXT,
  
  ai_generated_summary TEXT,
  ai_generated_recommendations TEXT[],
  
  sent_to_student_at TIMESTAMP,
  acknowledged_by_student_at TIMESTAMP,
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, code),
  INDEX idx_reports_student (tenant_id, student_id),
  INDEX idx_reports_template (tenant_id, report_template_code),
  INDEX idx_reports_period (report_period_start, report_period_end)
);
```

## Entity Relationships Diagram

```
TENANT (root)
  │
  ├─ 1:N ─── STUDENT
  │            │
  │            ├─ 1:N ─── ContactInfo (email, phone, etc.)
  │            ├─ 1:N ─── PhoneNumber (structured)
  │            ├─ 1:N ─── Address (residential, billing, etc.)
  │            ├─ 1:N ─── EmergencyContact
  │            ├─ 1:N ─── StudentDocument
  │            │            │
  │            │            └─ 1:N ─── DocumentVersion
  │            │
  │            ├─ 1:N ─── SwissEmploymentRecord (audit trail)
  │            ├─ 1:N ─── StudentLicense
  │            │
  │            ├─ 1:N ─── Experience
  │            │            ├─ 1:N ─── ExperienceResponsibility
  │            │            └─ 1:N ─── ExperienceReference
  │            │
  │            ├─ 1:N ─── Achievement
  │            │
  │            ├─ 1:N ─── StudentCompetency ──► Competency
  │            │
  │            ├─ 1:N ─── Timesheet
  │            │            └─ 1:N ─── TimesheetEntry ──► Project, TaskType
  │            │
  │            ├─ 1:N ─── Absence
  │            │            └─ 1:N ─── AbsenceDocument
  │            │
  │            ├─ 1:N ─── Evaluation
  │            │            └─ 1:N ─── EvaluationCriteria
  │            │
  │            └─ 1:N ─── Report
  │
  ├─ 1:N ─── Project
  │            └─ 1:N ─── ProjectAssignment ──► Student
  │
  ├─ 1:N ─── LearningPath
  │            └─ N:M ─── Competency (via learning_path_competencies)
  │
  ├─ 1:N ─── Competency (translatable)
  │            ├─ 1:N ─── StudentCompetency ──► Student
  │            └─ 1:N ─── EvaluationCriteria
  │
  └─ 1:N ─── TaskType (translatable)
```

## Key Normalization Patterns

### Pattern 1: One-to-Many Relationships
Instead of embedding arrays in the parent:
```
❌ Student { addresses: Address[], phones: Phone[] }
✅ Student (core)
   + Address[] (separate table, FK to Student)
   + PhoneNumber[] (separate table, FK to Student)
```

Benefits:
- Single source of truth
- Easy querying (filter by address type, phone type, etc.)
- Audit trail (know when contact info changed)
- Better performance (index on FK)

### Pattern 2: Type-Discriminated Entities
Contact info, addresses, phone numbers use `type` field:
```typescript
// ContactInfo
{ type: 'email', value: 'john@example.com', isPreferred: true }
{ type: 'phone', value: '+41 21 123 4567', isPreferred: false }

// Address
{ type: 'residential', street: '...', isPreferred: true }
{ type: 'billing', street: '...', isPreferred: false }
```

Benefits:
- Single flexible table for variations
- Easy to add new types without schema changes
- Query by type is indexed

### Pattern 3: Audit Trails for Historical Records
Employment status, licenses, competency levels change over time:
```typescript
SwissEmploymentRecord {
  studentId, status, effectiveDate, endDate, isCurrent,
  verifiedAt, source
}
```

Benefits:
- See entire history of status changes
- Know when records were verified
- Compliance/audit requirements
- Can reconstruct past state at any point in time

### Pattern 4: Junction Tables for Many-to-Many
StudentCompetency links Student to Competency with progress tracking:
```typescript
StudentCompetency {
  studentId, competencyCode,
  currentLevel, targetLevel, progressPercentage
}
```

Benefits:
- Flexible metadata about the relationship
- Can query "all competencies for a student" efficiently
- Can query "all students with competency X at level Y"

## Validation & Query Patterns

### Example: Get Student with All Related Data

```typescript
// Single query returns Student
const student = await studentRepo.findById(studentId);

// Separate queries for relationships (or use JOINs)
const contacts = await contactInfoRepo.findByStudentId(studentId);
const addresses = await addressRepo.findByStudentId(studentId);
const phones = await phoneNumberRepo.findByStudentId(studentId);
const employment = await employmentRepo.findCurrentByStudentId(studentId);
const experiences = await experienceRepo.findByStudentId(studentId);

// Return composed object
return {
  ...student,
  contacts,
  addresses,
  phones,
  employment,
  experiences,
};
```

### Example: Query Students with Specific Characteristics

```typescript
// Find all students with current residential address in Zurich
const zurichStudents = await db.query(
  `SELECT DISTINCT s.* FROM students s
   JOIN addresses a ON s.id = a.student_id
   WHERE a.type = 'residential' AND a.is_current = true
   AND a.city = 'Zurich'`
);

// Find students with LACI employment status
const laciStudents = await db.query(
  `SELECT DISTINCT s.* FROM students s
   JOIN swiss_employment_records ser ON s.id = ser.student_id
   WHERE ser.status = 'LACI' AND ser.is_current = true`
);

// Find students who need license renewal
const needsRenewal = await db.query(
  `SELECT s.*, sl.* FROM students s
   JOIN student_licenses sl ON s.id = sl.student_id
   WHERE sl.expiry_date < NOW() + INTERVAL '30 days'
   AND sl.is_active = true`
);
```

---

**Document Version**: 2.0 (Fully Normalized)  
**Last Updated**: March 17, 2026  
**Status**: Final - Optimized for Resume/CV Management Projects
