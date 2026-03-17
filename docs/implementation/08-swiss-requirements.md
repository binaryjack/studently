# Swiss-Specific Requirements

## Overview
Studently includes specific features to comply with Swiss employment regulations, social security systems, and educational standards. This document covers ORP integration, LACI/RI/AI status tracking, AVS/AHV requirements, and Swiss labor laws.

## Swiss Employment Status System

### Employment Status Types

```typescript
export enum SwissEmploymentStatus {
  /**
   * LACI - Assurance-chômage (Unemployment Insurance)
   * Person registered with unemployment office and receiving benefits
   */
  LACI = 'LACI',
  
  /**
   * RI - Revenu d'insertion (Social Assistance)
   * Person receiving social welfare assistance
   */
  RI = 'RI',
  
  /**
   * AI - Assurance-invalidité (Disability Insurance)
   * Person receiving disability benefits
   */
  AI = 'AI',
  
  /**
   * Employed - Currently working
   */
  EMPLOYED = 'EMPLOYED',
  
  /**
   * Unemployed - Not working, not receiving benefits
   */
  UNEMPLOYED = 'UNEMPLOYED',
  
  /**
   * Student - Full-time student
   */
  STUDENT = 'STUDENT',
  
  /**
   * Other - Other status
   */
  OTHER = 'OTHER',
}
```

### Student Extended Fields

```typescript
export interface SwissStudentFields {
  /**
   * AVS/AHV Number (Swiss Social Security Number)
   * Format: 756.XXXX.XXXX.XX
   */
  avsNumber?: string;
  
  /**
   * ORP Number (Unemployment Office Number)
   * Assigned by regional unemployment office (Office Régional de Placement)
   */
  orpNumber?: string;
  
  /**
   * Employment status
   */
  employmentStatus?: SwissEmploymentStatus;
  
  /**
   * LACI reference number (if receiving unemployment benefits)
   */
  laciReferenceNumber?: string;
  
  /**
   * RI case number (if receiving social assistance)
   */
  riCaseNumber?: string;
  
  /**
   * AI reference number (if receiving disability benefits)
   */
  aiReferenceNumber?: string;
  
  /**
   * Work permit type (for non-Swiss nationals)
   */
  workPermit?: 'B' | 'C' | 'G' | 'L' | 'N' | 'S' | 'NONE';
  
  /**
   * Work permit expiry date
   */
  workPermitExpiryDate?: string;
  
  /**
   * Canton of residence
   */
  canton: SwissCanton;
  
  /**
   * Monthly unemployment indemnity amount (CHF)
   */
  unemploymentIndemnityChf?: number;
  
  /**
   * Start date of unemployment benefits
   */
  unemploymentBenefitsStartDate?: string;
  
  /**
   * End date of unemployment benefits
   */
  unemploymentBenefitsEndDate?: string;
}
```

### Swiss Cantons

```typescript
export enum SwissCanton {
  AG = 'AG', // Aargau
  AI = 'AI', // Appenzell Innerrhoden
  AR = 'AR', // Appenzell Ausserrhoden
  BE = 'BE', // Bern / Berne
  BL = 'BL', // Basel-Landschaft
  BS = 'BS', // Basel-Stadt
  FR = 'FR', // Fribourg / Freiburg
  GE = 'GE', // Geneva / Genève
  GL = 'GL', // Glarus
  GR = 'GR', // Graubünden / Grisons
  JU = 'JU', // Jura
  LU = 'LU', // Luzern / Lucerne
  NE = 'NE', // Neuchâtel
  NW = 'NW', // Nidwalden
  OW = 'OW', // Obwalden
  SG = 'SG', // St. Gallen
  SH = 'SH', // Schaffhausen
  SO = 'SO', // Solothurn
  SZ = 'SZ', // Schwyz
  TG = 'TG', // Thurgau
  TI = 'TI', // Ticino / Tessin
  UR = 'UR', // Uri
  VD = 'VD', // Vaud
  VS = 'VS', // Valais / Wallis
  ZG = 'ZG', // Zug
  ZH = 'ZH', // Zürich
}
```

## ORP Integration

### ORP Data Exchange

```typescript
/**
 * ORP attendance report for unemployment benefit compliance
 */
export interface OrpAttendanceReport extends BaseEntity {
  studentId: string;
  orpNumber: string;
  
  reportingPeriodStart: string; // ISO 8601
  reportingPeriodEnd: string; // ISO 8601
  
  /**
   * Total training hours attended
   */
  totalHoursAttended: number;
  
  /**
   * Total hours expected (100% attendance)
   */
  totalHoursExpected: number;
  
  /**
   * Attendance percentage
   */
  attendancePercentage: number;
  
  /**
   * Detailed attendance by day
   */
  dailyAttendance: {
    date: string;
    hoursExpected: number;
    hoursAttended: number;
    absenceType?: 'JUSTIFIED' | 'UNJUSTIFIED' | 'SICK';
    notes?: string;
  }[];
  
  /**
   * Absences
   */
  absences: {
    startDate: string;
    endDate: string;
    type: 'JUSTIFIED' | 'UNJUSTIFIED' | 'SICK';
    certificateAttached: boolean;
  }[];
  
  /**
   * Performance notes
   */
  performanceNotes?: string;
  
  /**
   * Training status
   */
  trainingStatus: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'ON_HOLD';
  
  /**
   * Report generated date
   */
  generatedAt: string; // ISO 8601
  
  /**
   * Report submitted to ORP
   */
  submittedAt?: string; // ISO 8601
  
  /**
   * ORP acknowledgment received
   */
  acknowledgedAt?: string; // ISO 8601
  
  /**
   * PDF report URL
   */
  reportPdfUrl?: string;
}
```

### ORP API Integration

```typescript
export const OrpIntegrationService = function() {
  /**
   * Submit attendance report to ORP
   */
  const submitAttendanceReport = async (
    reportId: string
  ): Promise<{ success: boolean; orpReferenceNumber?: string; error?: string }> => {
    const report = await getReport(reportId);
    
    // Format according to ORP API specification
    const orpPayload = {
      orpNumber: report.orpNumber,
      institutionId: process.env.ORP_INSTITUTION_ID,
      periodStart: report.reportingPeriodStart,
      periodEnd: report.reportingPeriodEnd,
      attendanceData: report.dailyAttendance,
      absences: report.absences,
      status: report.trainingStatus,
    };
    
    try {
      const response = await axios.post(
        process.env.ORP_API_URL + '/attendance-reports',
        orpPayload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.ORP_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return {
        success: true,
        orpReferenceNumber: response.data.referenceNumber,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  /**
   * Verify student eligibility with ORP
   */
  const verifyEligibility = async (
    orpNumber: string
  ): Promise<{
    eligible: boolean;
    benefitType?: 'LACI' | 'RI' | 'AI';
    validUntil?: string;
    monthlyAmount?: number;
  }> => {
    try {
      const response = await axios.get(
        `${process.env.ORP_API_URL}/beneficiaries/${orpNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.ORP_API_KEY}`,
          },
        }
      );
      
      return {
        eligible: response.data.eligible,
        benefitType: response.data.benefitType,
        validUntil: response.data.validUntil,
        monthlyAmount: response.data.monthlyAmountChf,
      };
    } catch (error) {
      return { eligible: false };
    }
  };

  return {
    submitAttendanceReport,
    verifyEligibility,
  };
};
```

## Compliance Requirements

### Attendance Tracking Rules

```typescript
/**
 * Swiss labor law and ORP requirements for attendance tracking
 */
export const SwissAttendanceRules = {
  /**
   * Minimum attendance percentage required for unemployment benefits
   */
  MIN_ATTENDANCE_FOR_BENEFITS: 80,
  
  /**
   * Maximum consecutive absence days without justification
   */
  MAX_UNJUSTIFIED_ABSENCE_DAYS: 2,
  
  /**
   * Medical certificate required for sick leave longer than
   */
  MEDICAL_CERTIFICATE_REQUIRED_AFTER_DAYS: 3,
  
  /**
   * Report submission frequency (monthly)
   */
  REPORT_FREQUENCY_DAYS: 30,
  
  /**
   * Grace period for late submissions (days)
   */
  SUBMISSION_GRACE_PERIOD_DAYS: 5,
};

/**
 * Validate attendance for ORP compliance
 */
export const validateOrpCompliance = (
  attendance: OrpAttendanceReport
): {
  compliant: boolean;
  violations: string[];
  warnings: string[];
} => {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Check minimum attendance
  if (attendance.attendancePercentage < SwissAttendanceRules.MIN_ATTENDANCE_FOR_BENEFITS) {
    violations.push(
      `Attendance ${attendance.attendancePercentage}% is below required ${SwissAttendanceRules.MIN_ATTENDANCE_FOR_BENEFITS}%`
    );
  }
  
  // Check unjustified absences
  let consecutiveUnjustified = 0;
  for (const day of attendance.dailyAttendance.sort((a, b) => a.date.localeCompare(b.date))) {
    if (day.absenceType === 'UNJUSTIFIED') {
      consecutiveUnjustified++;
      if (consecutiveUnjustified > SwissAttendanceRules.MAX_UNJUSTIFIED_ABSENCE_DAYS) {
        violations.push(
          `Consecutive unjustified absences (${consecutiveUnjustified} days) exceed limit (${SwissAttendanceRules.MAX_UNJUSTIFIED_ABSENCE_DAYS})`
        );
        break;
      }
    } else {
      consecutiveUnjustified = 0;
    }
  }
  
  // Check medical certificates
  for (const absence of attendance.absences) {
    if (absence.type === 'SICK') {
      const duration = calculateDaysBetween(absence.startDate, absence.endDate);
      if (duration > SwissAttendanceRules.MEDICAL_CERTIFICATE_REQUIRED_AFTER_DAYS && !absence.certificateAttached) {
        warnings.push(
          `Sick leave from ${absence.startDate} to ${absence.endDate} requires medical certificate`
        );
      }
    }
  }
  
  return {
    compliant: violations.length === 0,
    violations,
    warnings,
  };
};
```

### Working Hours Regulations

```typescript
/**
 * Swiss labor law working hours limits
 */
export const SwissWorkingHoursLimits = {
  /**
   * Maximum weekly working hours for adults
   */
  MAX_WEEKLY_HOURS_ADULT: 45, // Industrial workers
  MAX_WEEKLY_HOURS_OFFICE: 42, // Office workers, technical/administrative
  
  /**
   * Maximum daily working hours
   */
  MAX_DAILY_HOURS: 10,
  
  /**
   * Maximum weekly working hours for young workers (15-18 years)
   */
  MAX_WEEKLY_HOURS_YOUTH: 40,
  
  /**
   * Maximum daily working hours for young workers
   */
  MAX_DAILY_HOURS_YOUTH: 9,
  
  /**
   * Minimum rest period between work days (hours)
   */
  MIN_REST_PERIOD_HOURS: 11,
  
  /**
   * Maximum consecutive work days
   */
  MAX_CONSECUTIVE_WORK_DAYS: 6,
  
  /**
   * Mandatory break after hours of continuous work
   */
  BREAK_REQUIRED_AFTER_HOURS: 5.5,
  BREAK_DURATION_MINUTES: 15,
};

/**
 * Validate timesheet against Swiss labor laws
 */
export const validateSwissWorkingHours = (
  timesheet: Timesheet,
  entries: TimesheetEntry[],
  studentDateOfBirth: string
): {
  valid: boolean;
  violations: string[];
  warnings: string[];
} => {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  const age = calculateAge(studentDateOfBirth);
  const isYouth = age < 18;
  
  const maxWeeklyHours = isYouth 
    ? SwissWorkingHoursLimits.MAX_WEEKLY_HOURS_YOUTH 
    : SwissWorkingHoursLimits.MAX_WEEKLY_HOURS_OFFICE;
  
  const maxDailyHours = isYouth
    ? SwissWorkingHoursLimits.MAX_DAILY_HOURS_YOUTH
    : SwissWorkingHoursLimits.MAX_DAILY_HOURS;
  
  // Check weekly total
  const totalWeeklyHours = timesheet.totalHours;
  if (totalWeeklyHours > maxWeeklyHours) {
    violations.push(
      `Weekly hours (${totalWeeklyHours}h) exceed legal limit (${maxWeeklyHours}h)`
    );
  }
  
  // Check daily totals
  const dailyTotals = entries.reduce((acc, entry) => {
    acc[entry.date] = (acc[entry.date] || 0) + entry.durationMinutes / 60;
    return acc;
  }, {} as Record<string, number>);
  
  for (const [date, hours] of Object.entries(dailyTotals)) {
    if (hours > maxDailyHours) {
      violations.push(
        `Daily hours on ${date} (${hours}h) exceed legal limit (${maxDailyHours}h)`
      );
    }
  }
  
  // Check rest periods
  const sortedDates = Object.keys(dailyTotals).sort();
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const hoursBetween = calculateHoursBetween(sortedDates[i], sortedDates[i + 1]);
    if (hoursBetween < SwissWorkingHoursLimits.MIN_REST_PERIOD_HOURS) {
      warnings.push(
        `Rest period between ${sortedDates[i]} and ${sortedDates[i + 1]} is less than ${SwissWorkingHoursLimits.MIN_REST_PERIOD_HOURS} hours`
      );
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
    warnings,
  };
};
```

## Financial Tracking

### Unemployment Benefits Tracking

```typescript
export interface UnemploymentBenefitRecord extends BaseEntity {
  studentId: string;
  
  /**
   * Benefit period
   */
  periodStart: string; // ISO 8601
  periodEnd: string; // ISO 8601
  
  /**
   * Monthly indemnity amount (CHF)
   */
  monthlyAmountChf: number;
  
  /**
   * Daily indemnity (calculated)
   */
  dailyAmountChf: number;
  
  /**
   * Days of benefits for this period
   */
  daysOfBenefits: number;
  
  /**
   * Total amount for period
   */
  totalAmountChf: number;
  
  /**
   * Benefit type
   */
  benefitType: 'LACI' | 'RI' | 'AI';
  
  /**
   * Payment status
   */
  paymentStatus: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'SUSPENDED';
  
  /**
   * Suspension reason (if applicable)
   */
  suspensionReason?: string;
  
  /**
   * ORP reference
   */
  orpReferenceNumber?: string;
}
```

## Multilingual Requirements

### Language Support

```typescript
export enum SwissLanguage {
  FR = 'fr', // French
  DE = 'de', // German
  IT = 'it', // Italian
  RM = 'rm', // Romansh
  EN = 'en', // English (business language)
}

/**
 * Document must support all official Swiss languages
 */
export interface MultilingualDocument {
  /**
   * Available languages
   */
  availableLanguages: SwissLanguage[];
  
  /**
   * Default language
   */
  defaultLanguage: SwissLanguage;
  
  /**
   * Document versions per language
   */
  versions: {
    language: SwissLanguage;
    documentUrl: string;
    generatedAt: string;
  }[];
}
```

## Data Privacy (Swiss Federal Data Protection Act)

### FADP Compliance

```typescript
/**
 * Swiss data privacy requirements (FADP - Loi fédérale sur la protection des données)
 */
export const SwissDataPrivacyRules = {
  /**
   * Data retention periods (years)
   */
  RETENTION_PERIOD_STUDENT_RECORDS: 10,
  RETENTION_PERIOD_FINANCIAL_RECORDS: 10,
  RETENTION_PERIOD_ABSENCE_RECORDS: 5,
  RETENTION_PERIOD_EVALUATION_RECORDS: 10,
  
  /**
   * Right to be forgotten - student data deletion after graduation
   */
  DELETE_AFTER_GRADUATION_YEARS: 10,
  
  /**
   * Sensitive data categories requiring explicit consent
   */
  SENSITIVE_DATA: [
    'health_information',
    'disability_status',
    'social_assistance_status',
    'religious_beliefs',
    'political_opinions',
  ],
};

/**
 * Data consent tracking
 */
export interface DataConsent extends BaseEntity {
  studentId: string;
  
  consentType: 'DATA_PROCESSING' | 'THIRD_PARTY_SHARING' | 'MARKETING' | 'RESEARCH';
  
  granted: boolean;
  grantedAt?: string; // ISO 8601
  revokedAt?: string; // ISO 8601
  
  purpose: string;
  
  dataCategories: string[];
  
  expiryDate?: string; // ISO 8601
}
```

## Environment Configuration

```env
# Swiss-specific settings
SWISS_DEFAULT_CANTON=VD
SWISS_DEFAULT_LANGUAGE=fr

# ORP Integration
ORP_API_URL=https://api.orp.ch
ORP_API_KEY=...
ORP_INSTITUTION_ID=CH-VD-12345

# Compliance
ENABLE_ORP_INTEGRATION=true
ENABLE_ATTENDANCE_VALIDATION=true
AUTO_SUBMIT_ORP_REPORTS=false

# Currency
DEFAULT_CURRENCY=CHF
```

---

**Document Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Final
