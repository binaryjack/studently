# Normalized Entities - Implementation Examples

## Overview

This document shows practical TypeScript examples for working with the fully normalized entity model using Feature Slice Design pattern.

## Directory Structure (Feature Slice)

```
features/student/
├── index.ts                          # Public API
├── api/
│   ├── student.controller.ts        # HTTP handlers
│   ├── student.routes.ts            # Route definitions
│   └── student.validation.ts        # Zod schemas
├── model/
│   ├── student.types.ts             # TypeScript interfaces
│   ├── contact-info.types.ts
│   ├── phone-number.types.ts
│   ├── address.types.ts
│   └── swiss-employment.types.ts
└── lib/
    ├── student.service.ts           # Business logic
    ├── student.repository.ts        # Data access
    ├── contact-info.service.ts
    ├── contact-info.repository.ts
    ├── address.service.ts
    ├── address.repository.ts
    ├── swiss-employment.service.ts
    └── swiss-employment.repository.ts
```

## 1. Type Definitions

### student.types.ts

```typescript
import { BaseEntity, FlaggedEntity } from '@shared/types';

/**
 * Core student identity
 */
export interface Student extends BaseEntity, FlaggedEntity {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  enrollmentDate: string;
  expectedGraduationDate?: string;
  currentLearningPathCode?: string;
  currentStatus: 'ENROLLED' | 'ACTIVE' | 'ON_LEAVE' | 'GRADUATED' | 'DROPPED' | 'SUSPENDED';
  
  profileImageUrl?: string;
  notes?: string;
}

/**
 * API input for creating student
 */
export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  enrollmentDate: string;
  currentLearningPathCode?: string;
}

/**
 * API response with related data
 */
export interface StudentResponse extends Student {
  contacts?: ContactInfoResponse[];
  phones?: PhoneNumberResponse[];
  addresses?: AddressResponse[];
  emergencyContacts?: EmergencyContactResponse[];
  currentEmployment?: SwissEmploymentRecordResponse;
  experiences?: ExperienceResponse[];
  achievements?: AchievementResponse[];
}
```

### contact-info.types.ts

```typescript
import { BaseEntity } from '@shared/types';

export type ContactInfoType = 'email' | 'phone' | 'mobile' | 'whatsapp' | 'linkedin' | 'other';

export interface ContactInfo extends BaseEntity {
  studentId: string;
  type: ContactInfoType;
  value: string;
  label?: string;
  isPreferred: boolean;
  isPublic: boolean;
  verifiedAt?: string;
  verificationToken?: string;
}

export interface ContactInfoResponse extends ContactInfo {
  isVerified: boolean; // Computed
}

export interface CreateContactInfoInput {
  type: ContactInfoType;
  value: string;
  label?: string;
  isPublic?: boolean;
}

export interface UpdateContactInfoInput extends Partial<CreateContactInfoInput> {
  isPreferred?: boolean;
}
```

### phone-number.types.ts

```typescript
import { BaseEntity } from '@shared/types';

export type PhoneNumberType = 'mobile' | 'home' | 'work' | 'other';

export interface PhoneNumber extends BaseEntity {
  studentId: string;
  type: PhoneNumberType;
  countryCode: string; // "+41"
  areaCode?: string;
  number: string;
  extension?: string;
  label?: string;
  isPreferred: boolean;
  canReceiveSms: boolean;
  canReceiveWhatsapp: boolean;
}

export interface PhoneNumberResponse extends PhoneNumber {
  formatted: string; // "+41 21 123 4567" (computed)
}

export interface CreatePhoneNumberInput {
  type: PhoneNumberType;
  countryCode: string;
  areaCode?: string;
  number: string;
  extension?: string;
  label?: string;
  canReceiveSms?: boolean;
  canReceiveWhatsapp?: boolean;
}
```

### address.types.ts

```typescript
import { BaseEntity } from '@shared/types';

export type AddressType = 'residential' | 'billing' | 'work' | 'emergency' | 'mailing' | 'other';

export interface Address extends BaseEntity {
  studentId: string;
  type: AddressType;
  label?: string;
  streetAddress: string;
  streetAddress2?: string;
  city: string;
  postalCode: string;
  canton?: string;
  country: string; // ISO 3166-1 alpha-2
  latitude?: number;
  longitude?: number;
  isPreferred: boolean;
  isCurrent: boolean;
  moveInDate?: string;
  moveOutDate?: string;
}

export interface AddressResponse extends Address {
  formattedAddress: string; // "Rue X, 1201 Geneva, CH"
  isArchived: boolean; // Computed: moveOutDate < today
}

export interface CreateAddressInput {
  type: AddressType;
  label?: string;
  streetAddress: string;
  streetAddress2?: string;
  city: string;
  postalCode: string;
  canton?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  moveInDate?: string;
}
```

### swiss-employment.types.ts

```typescript
import { BaseEntity } from '@shared/types';

export type SwissEmploymentStatus = 'LACI' | 'RI' | 'AI' | 'EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'OTHER';
export type ComplianceStatus = 'COMPLIANT' | 'AT_RISK' | 'NON_COMPLIANT' | 'ARCHIVED';
export type RecordSource = 'MANUAL_ENTRY' | 'ORP_INTEGRATION' | 'STUDENT_SELF_REPORT' | 'DOCUMENT_UPLOAD' | 'IMPORT';

export interface SwissEmploymentRecord extends BaseEntity {
  studentId: string;
  status: SwissEmploymentStatus;
  orpNumber?: string;
  laciReferenceNumber?: string;
  riCaseNumber?: string;
  aiReferenceNumber?: string;
  avsNumber?: string; // Format: 756.XXXX.XXXX.XX
  workPermit?: 'B' | 'C' | 'G' | 'L' | 'N' | 'S' | 'NONE';
  workPermitExpiryDate?: string;
  effectiveDate: string;
  endDate?: string; // null if current
  isCurrent: boolean;
  unemploymentIndemnityChf?: number;
  unemploymentBenefitsStartDate?: string;
  unemploymentBenefitsEndDate?: string;
  benefitsPeriodWeeks?: number;
  complianceStatus?: ComplianceStatus;
  lastComplianceCheckDate?: string;
  complianceNotes?: string;
  verifiedByUserId?: string;
  verifiedAt?: string;
  source?: RecordSource;
  sourceDocumentId?: string;
}

export interface SwissEmploymentRecordResponse extends SwissEmploymentRecord {
  days UntilBenefitsExpiry?: number; // Computed
  daysUntilWorkPermitExpiry?: number; // Computed
  statusLabel: string; // Translated
}

export interface CreateSwissEmploymentRecordInput {
  status: SwissEmploymentStatus;
  orpNumber?: string;
  avsNumber?: string;
  workPermit?: string;
  workPermitExpiryDate?: string;
  effectiveDate: string;
  source?: RecordSource;
  sourceDocumentId?: string;
}
```

## 2. Zod Validation Schemas

### student.validation.ts

```typescript
import { z } from 'zod';
import { BaseEntitySchema } from '@shared/validation';

export const CreateStudentSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  enrollmentDate: z.string().datetime(),
  expectedGraduationDate: z.string().datetime().optional(),
  currentLearningPathCode: z.string().max(255).optional(),
});

export const UpdateStudentSchema = CreateStudentSchema.partial();

export const StudentQuerySchema = z.object({
  searchText: z.string().optional(),
  status: z.enum(['ENROLLED', 'ACTIVE', 'ON_LEAVE', 'GRADUATED', 'DROPPED']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'enrollmentDate']).default('lastName'),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
export type StudentQuery = z.infer<typeof StudentQuerySchema>;
```

### contact-info.validation.ts

```typescript
import { z } from 'zod';

const ContactInfoTypeSchema = z.enum(['email', 'phone', 'mobile', 'whatsapp', 'linkedin', 'other']);

export const CreateContactInfoSchema = z.object({
  type: ContactInfoTypeSchema,
  value: z.string().min(1).max(500),
  label: z.string().max(100).optional(),
  isPublic: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.type === 'email' && !data.value.includes('@')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: 'Invalid email address',
    });
  }
  if ((data.type === 'phone' || data.type === 'mobile') && !/^\+?[0-9\s\-()]+$/.test(data.value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: 'Invalid phone number',
    });
  }
});

export const UpdateContactInfoSchema = CreateContactInfoSchema.partial().extend({
  isPreferred: z.boolean().optional(),
});

export type CreateContactInfoInput = z.infer<typeof CreateContactInfoSchema>;
export type UpdateContactInfoInput = z.infer<typeof UpdateContactInfoSchema>;
```

## 3. Repository Layer

### student.repository.ts

```typescript
import { Database } from '@shared/db';
import { Student, StudentResponse } from '../model/student.types';
import { ContactInfoRepository } from './contact-info.repository';
import { AddressRepository } from './address.repository';
import { SwissEmploymentRepository } from './swiss-employment.repository';
import { ExperienceRepository } from './experience.repository';

/**
 * Factory function for StudentRepository
 * No classes, pure functions
 */
export const StudentRepository = function(db: Database) {
  const contactInfoRepo = ContactInfoRepository(db);
  const addressRepo = AddressRepository(db);
  const employmentRepo = SwissEmploymentRepository(db);
  const experienceRepo = ExperienceRepository(db);

  /**
   * Get student by ID with all related data
   */
  const findByIdWithRelations = async (
    tenantId: string,
    studentId: string,
  ): Promise<StudentResponse | null> => {
    // Query main student
    const student = await db.query<Student>(
      `SELECT * FROM students 
       WHERE id = $1 AND tenant_id = $2 AND is_active = true`,
      [studentId, tenantId],
    );

    if (!student) return null;

    // Load related data in parallel
    const [contacts, phones, addresses, emergencyContacts, employment, experiences] = await Promise.all([
      contactInfoRepo.findByStudentId(tenantId, studentId),
      phoneNumberRepo.findByStudentId(tenantId, studentId),
      addressRepo.findByStudentId(tenantId, studentId),
      emergencyContactRepo.findByStudentId(tenantId, studentId),
      employmentRepo.findCurrentByStudentId(tenantId, studentId),
      experienceRepo.findByStudentId(tenantId, studentId),
    ]);

    return {
      ...student,
      contacts,
      phones,
      addresses,
      emergencyContacts,
      currentEmployment: employment,
      experiences,
    };
  };

  /**
   * Find students with cursor pagination
   * Returns array + hasMore flag + nextCursor
   */
  const findMany = async (
    tenantId: string,
    options: {
      status?: string;
      searchText?: string;
      limit: number;
      cursor?: string;
      sortBy: 'firstName' | 'lastName' | 'enrollmentDate';
    },
  ) => {
    const { limit, cursor, status, searchText, sortBy } = options;

    // Build WHERE clause
    let whereClause = 'WHERE tenant_id = $1 AND is_active = true';
    let params: any[] = [tenantId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND current_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (searchText) {
      whereClause += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
      params.push(`%${searchText}%`);
      paramIndex++;
    }

    // Cursor-based pagination
    if (cursor) {
      whereClause += ` AND sequence > $${paramIndex}`;
      params.push(parseInt(cursor));
      paramIndex++;
    }

    // Query one extra row to determine if hasMore
    const students = await db.query<Student>(
      `SELECT * FROM students 
       ${whereClause}
       ORDER BY ${sortBy === 'enrollmentDate' ? 'enrollment_date DESC' : `${sortBy.toLowerCase()} ASC`}
       LIMIT $${paramIndex}`,
      [...params, limit + 1],
    );

    const hasMore = students.length > limit;
    const items = hasMore ? students.slice(0, -1) : students;
    const nextCursor = hasMore ? items[items.length - 1]?.sequence.toString() : null;

    return {
      items,
      hasMore,
      nextCursor,
    };
  };

  /**
   * Create new student
   */
  const create = async (
    tenantId: string,
    userId: string,
    input: CreateStudentInput,
  ): Promise<Student> => {
    const student = await db.query<Student>(
      `INSERT INTO students (
        tenant_id, code, sequence, "order",
        first_name, last_name, date_of_birth, gender,
        enrollment_date, expected_graduation_date, current_learning_path_code,
        current_status, profile_image_url, notes,
        is_selected, is_active, created_by, updated_by
      ) VALUES ($1, $2, nextval('students_sequence'), 0,
        $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false, true, $13, $13)
      RETURNING *`,
      [
        tenantId,
        input.code, // Code should be provided (unique business identifier)
        input.firstName,
        input.lastName,
        input.dateOfBirth,
        input.gender,
        input.enrollmentDate,
        input.expectedGraduationDate,
        input.currentLearningPathCode,
        input.currentStatus,
        input.profileImageUrl,
        input.notes,
        userId,
      ],
    );

    return student;
  };

  return {
    findByIdWithRelations,
    findMany,
    create,
    // ... update, delete, etc.
  };
};

export type StudentRepository = ReturnType<typeof StudentRepository>;
```

### contact-info.repository.ts

```typescript
import { Database } from '@shared/db';
import { ContactInfo, ContactInfoResponse, CreateContactInfoInput } from '../model/contact-info.types';

export const ContactInfoRepository = function(db: Database) {
  /**
   * Find all contact info for a student
   */
  const findByStudentId = async (
    tenantId: string,
    studentId: string,
  ): Promise<ContactInfoResponse[]> => {
    const contacts = await db.query<ContactInfo>(
      `SELECT * FROM contact_infos
       WHERE tenant_id = $1 AND student_id = $2
       ORDER BY is_preferred DESC, "order" ASC`,
      [tenantId, studentId],
    );

    return contacts.map(c => ({
      ...c,
      isVerified: !!c.verifiedAt,
    }));
  };

  /**
   * Find preferred contact of a type
   */
  const findPreferredByType = async (
    tenantId: string,
    studentId: string,
    type: string,
  ): Promise<ContactInfoResponse | null> => {
    const contact = await db.queryOne<ContactInfo>(
      `SELECT * FROM contact_infos
       WHERE tenant_id = $1 AND student_id = $2 AND type = $3 AND is_preferred = true
       LIMIT 1`,
      [tenantId, studentId, type],
    );

    if (!contact) return null;

    return {
      ...contact,
      isVerified: !!contact.verifiedAt,
    };
  };

  /**
   * Find contact by value (email, phone, etc.)
   * Useful for verification, duplicate checking
   */
  const findByValue = async (
    tenantId: string,
    type: string,
    value: string,
  ): Promise<ContactInfo[]> => {
    return db.query<ContactInfo>(
      `SELECT * FROM contact_infos
       WHERE tenant_id = $1 AND type = $2 AND value = $3`,
      [tenantId, type, value],
    );
  };

  /**
   * Create contact info
   */
  const create = async (
    tenantId: string,
    studentId: string,
    userId: string,
    input: CreateContactInfoInput,
  ): Promise<ContactInfoResponse> => {
    const contact = await db.query<ContactInfo>(
      `INSERT INTO contact_infos (
        tenant_id, student_id, code, sequence, "order",
        type, value, label, is_preferred, is_public,
        created_by, updated_by
      ) VALUES ($1, $2, $3, nextval('contact_infos_sequence'), 0,
        $4, $5, $6, false, $7, $8, $8)
      RETURNING *`,
      [
        tenantId,
        studentId,
        `${studentId}-${input.type}-${Date.now()}`, // Unique code
        input.type,
        input.value,
        input.label,
        input.isPublic ?? false,
        userId,
      ],
    );

    return {
      ...contact,
      isVerified: !!contact.verifiedAt,
    };
  };

  /**
   * Set as preferred (unset others of same type)
   */
  const setPreferred = async (
    tenantId: string,
    contactId: string,
  ): Promise<void> => {
    await db.query(
      `UPDATE contact_infos SET is_preferred = false
       WHERE id IN (
         SELECT id FROM contact_infos
         WHERE tenant_id = $1 AND type = (
           SELECT type FROM contact_infos WHERE id = $2
         )
       )`,
      [tenantId, contactId],
    );

    await db.query(
      `UPDATE contact_infos SET is_preferred = true
       WHERE id = $1`,
      [contactId],
    );
  };

  /**
   * Verify contact (email, phone)
   */
  const verify = async (
    tenantId: string,
    contactId: string,
  ): Promise<void> => {
    await db.query(
      `UPDATE contact_infos
       SET verified_at = NOW(), verification_token = NULL
       WHERE id = $1 AND tenant_id = $2`,
      [contactId, tenantId],
    );
  };

  return {
    findByStudentId,
    findPreferredByType,
    findByValue,
    create,
    setPreferred,
    verify,
    // ... update, delete, etc.
  };
};

export type ContactInfoRepository = ReturnType<typeof ContactInfoRepository>;
```

### address.repository.ts

```typescript
import { Database } from '@shared/db';
import { Address, AddressResponse, CreateAddressInput } from '../model/address.types';

export const AddressRepository = function(db: Database) {
  /**
   * Find all addresses for student
   */
  const findByStudentId = async (
    tenantId: string,
    studentId: string,
  ): Promise<AddressResponse[]> => {
    const addresses = await db.query<Address>(
      `SELECT * FROM addresses
       WHERE tenant_id = $1 AND student_id = $2
       ORDER BY type, is_preferred DESC`,
      [tenantId, studentId],
    );

    return addresses.map(formatAddress);
  };

  /**
   * Find current residential address
   */
  const findCurrentResidential = async (
    tenantId: string,
    studentId: string,
  ): Promise<AddressResponse | null> => {
    const address = await db.queryOne<Address>(
      `SELECT * FROM addresses
       WHERE tenant_id = $1 AND student_id = $2 AND type = 'residential'
       AND is_current = true`,
      [tenantId, studentId],
    );

    if (!address) return null;
    return formatAddress(address);
  };

  /**
   * Find addresses in a specific canton
   * Useful for reporting, filtering by location
   */
  const findByCantonAndType = async (
    tenantId: string,
    canton: string,
    type?: string,
  ): Promise<Address[]> => {
    let query = `SELECT * FROM addresses
                 WHERE tenant_id = $1 AND canton = $2 AND is_current = true`;
    let params: any[] = [tenantId, canton];

    if (type) {
      query += ` AND type = $3`;
      params.push(type);
    }

    return db.query<Address>(query, params);
  };

  /**
   * Create address
   */
  const create = async (
    tenantId: string,
    studentId: string,
    userId: string,
    input: CreateAddressInput,
  ): Promise<AddressResponse> => {
    // If new residential address and setting as current, unset previous current
    if (input.type === 'residential' && input.moveInDate) {
      await db.query(
        `UPDATE addresses
         SET is_current = false, move_out_date = NOW()
         WHERE tenant_id = $1 AND student_id = $2 AND type = 'residential'
         AND is_current = true`,
        [tenantId, studentId],
      );
    }

    const address = await db.query<Address>(
      `INSERT INTO addresses (
        tenant_id, student_id, code, sequence, "order",
        type, label, street_address, street_address2, city,
        postal_code, canton, country, latitude, longitude,
        is_preferred, is_current, move_in_date,
        created_by, updated_by
      ) VALUES ($1, $2, $3, nextval('addresses_sequence'), 0,
        $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        true, true, $14, $15, $15)
      RETURNING *`,
      [
        tenantId,
        studentId,
        `${studentId}-${input.type}-${Date.now()}`,
        input.type,
        input.label,
        input.streetAddress,
        input.streetAddress2,
        input.city,
        input.postalCode,
        input.canton,
        input.country,
        input.latitude,
        input.longitude,
        input.moveInDate,
        userId,
      ],
    );

    return formatAddress(address);
  };

  /**
   * Mark address as moved out
   */
  const markMoveOut = async (
    tenantId: string,
    addressId: string,
  ): Promise<void> => {
    await db.query(
      `UPDATE addresses
       SET is_current = false, move_out_date = NOW()
       WHERE id = $1 AND tenant_id = $2`,
      [addressId, tenantId],
    );
  };

  const formatAddress = (address: Address): AddressResponse => ({
    ...address,
    formattedAddress: `${address.streetAddress}${address.streetAddress2 ? ', ' + address.streetAddress2 : ''}, ${address.postalCode} ${address.city}, ${address.country}`,
    isArchived: address.moveOutDate ? new Date(address.moveOutDate) < new Date() : false,
  });

  return {
    findByStudentId,
    findCurrentResidential,
    findByCantonAndType,
    create,
    markMoveOut,
    // ... update, delete, etc.
  };
};

export type AddressRepository = ReturnType<typeof AddressRepository>;
```

### swiss-employment.repository.ts

```typescript
import { Database } from '@shared/db';
import { SwissEmploymentRecord, SwissEmploymentRecordResponse } from '../model/swiss-employment.types';

export const SwissEmploymentRepository = function(db: Database) {
  /**
   * Find current employment status
   */
  const findCurrentByStudentId = async (
    tenantId: string,
    studentId: string,
  ): Promise<SwissEmploymentRecordResponse | null> => {
    const record = await db.queryOne<SwissEmploymentRecord>(
      `SELECT * FROM swiss_employment_records
       WHERE tenant_id = $1 AND student_id = $2 AND is_current = true`,
      [tenantId, studentId],
    );

    if (!record) return null;
    return formatResponse(record);
  };

  /**
   * Find complete employment history
   */
  const findHistoryByStudentId = async (
    tenantId: string,
    studentId: string,
  ): Promise<SwissEmploymentRecordResponse[]> => {
    const records = await db.query<SwissEmploymentRecord>(
      `SELECT * FROM swiss_employment_records
       WHERE tenant_id = $1 AND student_id = $2 AND is_active = true
       ORDER BY effective_date DESC`,
      [tenantId, studentId],
    );

    return records.map(formatResponse);
  };

  /**
   * Find students with specific employment status
   * Useful for ORP reporting, compliance checks
   */
  const findByStatus = async (
    tenantId: string,
    status: string,
  ): Promise<SwissEmploymentRecord[]> => {
    return db.query<SwissEmploymentRecord>(
      `SELECT DISTINCT s.*, ser.* FROM students s
       JOIN swiss_employment_records ser ON s.id = ser.student_id
       WHERE s.tenant_id = $1 AND ser.status = $2 AND ser.is_current = true`,
      [tenantId, status],
    );
  };

  /**
   * Find students needing compliance check
   */
  const findNeedingComplianceCheck = async (
    tenantId: string,
    daysSinceLastCheck = 30,
  ): Promise<SwissEmploymentRecord[]> => {
    return db.query<SwissEmploymentRecord>(
      `SELECT * FROM swiss_employment_records
       WHERE tenant_id = $1 AND is_current = true
       AND (last_compliance_check_date IS NULL
            OR last_compliance_check_date < NOW() - INTERVAL '${daysSinceLastCheck} days')`,
      [tenantId],
    );
  };

  /**
   * Create new employment record
   * Previous record automatically becomes history (end_date set)
   */
  const create = async (
    tenantId: string,
    studentId: string,
    userId: string,
    input: CreateSwissEmploymentRecordInput,
  ): Promise<SwissEmploymentRecordResponse> => {
    // Mark previous as history
    await db.query(
      `UPDATE swiss_employment_records
       SET is_current = false, end_date = NOW()
       WHERE tenant_id = $1 AND student_id = $2 AND is_current = true`,
      [tenantId, studentId],
    );

    // Create new record
    const record = await db.query<SwissEmploymentRecord>(
      `INSERT INTO swiss_employment_records (
        tenant_id, student_id, code, sequence, "order",
        status, orp_number, laci_reference_number, ri_case_number, ai_reference_number,
        avs_number, work_permit, work_permit_expiry_date,
        effective_date, is_current,
        source, source_document_id,
        created_by, updated_by
      ) VALUES ($1, $2, $3, nextval('swiss_employment_records_sequence'), 0,
        $4, $5, $6, $7, $8, $9, $10, $11, $12, true,
        $13, $14, $15, $15)
      RETURNING *`,
      [
        tenantId,
        studentId,
        `${studentId}-${input.status}-${Date.now()}`,
        input.status,
        input.orpNumber,
        null, // LACI ref set separately
        null, // RI case set separately
        null, // AI ref set separately
        input.avsNumber,
        input.workPermit,
        input.workPermitExpiryDate,
        input.effectiveDate,
        input.source,
        input.sourceDocumentId,
        userId,
      ],
    );

    return formatResponse(record);
  };

  /**
   * Verify employment record
   */
  const verify = async (
    tenantId: string,
    recordId: string,
    userId: string,
    complianceStatus: string,
    notes?: string,
  ): Promise<void> => {
    await db.query(
      `UPDATE swiss_employment_records
       SET verified_at = NOW(), verified_by_user_id = $2,
           compliance_status = $3, last_compliance_check_date = NOW(),
           compliance_notes = $4
       WHERE id = $1 AND tenant_id = $5`,
      [recordId, userId, complianceStatus, notes, tenantId],
    );
  };

  const formatResponse = (record: SwissEmploymentRecord): SwissEmploymentRecordResponse => ({
    ...record,
    daysUntilBenefitsExpiry: record.unemploymentBenefitsEndDate
      ? Math.ceil((new Date(record.unemploymentBenefitsEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : undefined,
    daysUntilWorkPermitExpiry: record.workPermitExpiryDate
      ? Math.ceil((new Date(record.workPermitExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : undefined,
    statusLabel: `employment_status.${record.status}`, // For i18n
  });

  return {
    findCurrentByStudentId,
    findHistoryByStudentId,
    findByStatus,
    findNeedingComplianceCheck,
    create,
    verify,
    // ... update, delete, etc.
  };
};

export type SwissEmploymentRepository = ReturnType<typeof SwissEmploymentRepository>;
```

## 4. Service Layer

### student.service.ts

```typescript
import { StudentRepository } from './student.repository';
import { ContactInfoRepository } from './contact-info.repository';
import { AddressRepository } from './address.repository';
import { StudentResponse, CreateStudentInput } from '../model/student.types';
import { ContactInfoRepository } from './contact-info.repository';

export const StudentService = function(
  studentRepo: StudentRepository,
  contactInfoRepo: ContactInfoRepository,
  addressRepo: AddressRepository,
  // ... other repos
) {
  /**
   * Get student profile with all related data
   */
  const getProfile = async (
    tenantId: string,
    studentId: string,
  ): Promise<StudentResponse> => {
    const student = await studentRepo.findByIdWithRelations(tenantId, studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }

    return student;
  };

  /**
   * Create new student with initial contact info
   */
  const createStudentWithContacts = async (
    tenantId: string,
    userId: string,
    studentInput: CreateStudentInput,
    initialContacts?: { type: string; value: string }[],
  ): Promise<StudentResponse> => {
    // Create student
    const student = await studentRepo.create(tenantId, userId, studentInput);

    // Add initial contacts if provided
    if (initialContacts?.length) {
      for (const contact of initialContacts) {
        await contactInfoRepo.create(tenantId, student.id, userId, contact);
      }
    }

    // Return full profile
    return studentRepo.findByIdWithRelations(tenantId, student.id);
  };

  /**
   * Update student contact information
   */
  const updateContactInfo = async (
    tenantId: string,
    studentId: string,
    userId: string,
    updates: { type: string; updates: Record<string, any> }[],
  ): Promise<void> => {
    for (const { type, updates: contactUpdates } of updates) {
      if (contactUpdates.isPreferred) {
        // Unset preference on other contacts of same type
        const preferred = await contactInfoRepo.findPreferredByType(tenantId, studentId, type);
        if (preferred) {
          await contactInfoRepo.setPreferred(tenantId, preferred.id);
        }
      }
    }
  };

  /**
   * Register residential address change
   */
  const moveToNewAddress = async (
    tenantId: string,
    studentId: string,
    userId: string,
    newAddressInput: CreateAddressInput,
  ): Promise<void> => {
    // Create new address (automatically marks previous as history)
    const address = await addressRepo.create(tenantId, studentId, userId, {
      ...newAddressInput,
      type: 'residential',
    });

    // Could trigger workflow or notification here
    // await notificationService.notifyAddressChange(studentId, address);
  };

  return {
    getProfile,
    createStudentWithContacts,
    updateContactInfo,
    moveToNewAddress,
    // ... other methods
  };
};

export type StudentService = ReturnType<typeof StudentService>;
```

## 5. Controller & Routes

### student.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../lib/student.service';
import { CreateStudentSchema, UpdateStudentSchema } from '../api/student.validation';

export const StudentController = function(studentService: StudentService) {
  /**
   * GET /students/:id
   * Get student profile with all related data
   */
  const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenantId = req.context.tenantId; // From middleware

      const student = await studentService.getProfile(tenantId, id);

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /students
   * Create student with initial contact info
   */
  const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentInput, contacts } = CreateStudentSchema.parse(req.body);
      const tenantId = req.context.tenantId;
      const userId = req.context.userId;

      const student = await studentService.createStudentWithContacts(
        tenantId,
        userId,
        studentInput,
        contacts,
      );

      res.status(201).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /students/:id/address
   * Move to new residential address
   */
  const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { streetAddress, city, postalCode, canton, moveInDate } = req.body;
      const tenantId = req.context.tenantId;
      const userId = req.context.userId;

      await studentService.moveToNewAddress(tenantId, id, userId, {
        streetAddress,
        city,
        postalCode,
        canton,
        moveInDate,
      });

      const updated = await studentService.getProfile(tenantId, id);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  return {
    getOne,
    create,
    updateAddress,
  };
};
```

### student.routes.ts

```typescript
import { Router } from 'express';
import { StudentController } from './student.controller';
import { authMiddleware, tenantMiddleware } from '@shared/middleware';

export const studentRoutes = function(controller: StudentController) {
  const router = Router();

  router.use(authMiddleware);
  router.use(tenantMiddleware);

  router.get('/:id', controller.getOne);
  router.post('/', controller.create);
  router.put('/:id/address', controller.updateAddress);

  return router;
};
```

## 6. Public API (index.ts)

```typescript
// features/student/index.ts

// Export types only (not implementation details)
export type {
  Student,
  StudentResponse,
  CreateStudentInput,
  ContactInfo,
  ContactInfoResponse,
  Address,
  AddressResponse,
  PhoneNumber,
  PhoneNumberResponse,
  SwissEmploymentRecord,
  SwissEmploymentRecordResponse,
} from './model';

// Export service interface (consumers create their own instance)
export { StudentService } from './lib/student.service';
export { ContactInfoService } from './lib/contact-info.service';
export { AddressService } from './lib/address.service';
export { SwissEmploymentService } from './lib/swiss-employment.service';

// Export routes
export { studentRoutes } from './api/student.routes';

// DO NOT EXPORT:
// - Controller (internal implementation detail)
// - Repository (internal data layer)
// - Validation schemas (internal API contract)
```

---

**Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Ready for Implementation
