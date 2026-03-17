# Administrative Settings Architecture

## Overview

Complete settings management system covering organizational configuration, user management, system behavior, integrations, and compliance. Designed as a **separate Settings Domain** within DDD architecture.

---

## Settings Hierarchy

```
┌─────────────────────────────────────────────────────┐
│            SETTINGS ORGANIZATION                     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  BASE SETTINGS (Essential, Tenant Admin)            │
│  ├── Organization Profile                           │
│  ├── Role Matrix Management                         │
│  ├── Basic Email Configuration                      │
│  └── Theming Essentials                             │
│                                                       │
│  ADVANCED SETTINGS (Complex, System Admin)          │
│  ├── AI Provider Configuration                      │
│  ├── Backup & Restore                               │
│  ├── Data Privacy (Anonymization, Encryption)      │
│  ├── Compliance Rules (Swiss/Labor Laws)            │
│  ├── Advanced Email Templates                       │
│  ├── Asset Management (Logos, Banners, PDFs)        │
│  └── Performance Tuning                             │
│                                                       │
│  SYSTEM SETTINGS (Platform-wide, System Admin Only) │
│  ├── Internationalization (i18n)                    │
│  ├── Security Policies                              │
│  ├── Rate Limiting                                  │
│  └── Audit Log Retention                            │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## Part 1: Settings Domain Structure

### Core Entity Types

```typescript
// src/domains/settings/core/setting.types.ts

export type SettingCategory =
  | 'ORGANIZATION'
  | 'ROLES_PERMISSIONS'
  | 'EMAIL'
  | 'AI'
  | 'BACKUP'
  | 'PRIVACY'
  | 'COMPLIANCE'
  | 'ASSETS'
  | 'THEME'
  | 'I18N'
  | 'SECURITY'
  | 'INTEGRATIONS';

export type SettingAccessLevel = 'BASE' | 'ADVANCED' | 'SYSTEM';

export interface SettingDefinition extends BaseEntity {
  // Identity
  key: string; // e.g., 'email.provider', 'organization.name'
  displayName: string;
  description?: string;
  
  // Classification
  category: SettingCategory;
  accessLevel: SettingAccessLevel;
  scope: 'TENANT' | 'SYSTEM';
  
  // Metadata
  valueType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'FILE' | 'ENUM';
  defaultValue?: any;
  isRequired: boolean;
  isEncrypted: boolean; // For sensitive data (API keys, passwords)
  
  // UI
  uiComponent: 'TEXT_INPUT' | 'TEXTAREA' | 'SELECT' | 'TOGGLE' | 'FILE_UPLOAD' | 'COLOR_PICKER' | 'RICH_EDITOR';
  uiOptions?: {
    placeholder?: string;
    helpText?: string;
    maxLength?: number;
    pattern?: string; // Regex for validation
    options?: { value: string; label: string }[]; // For SELECT
    accept?: string; // For FILE_UPLOAD
  };
  
  // Validation
  validators?: ('EMAIL' | 'URL' | 'PORT' | 'CRON' | 'JSON')[];
  customValidationSchema?: any; // Zod schema
  
  // Permissions
  requiredPermission?: string;
  canBeDynamic: boolean; // Can be changed without restart?
  
  // Change tracking
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface SettingValue extends BaseEntity {
  tenantId: string;
  settingKey: string; // FK to SettingDefinition.key
  value: any;
  previousValue?: any; // For audit trail
  
  // Audit
  modifiedBy: string;
  modifiedAt: string;
  changeReason?: string;
}

export interface SettingCategory {
  id: string;
  name: string;
  icon: string;
  accessLevel: SettingAccessLevel;
  description: string;
  settingsCount: number;
}
```

---

## Part 2: BASE SETTINGS

### 1. Organization Profile

```typescript
// src/domains/settings/core/organization-settings.types.ts

export interface OrganizationSettings {
  // Basic Info
  organizationName: string;
  organizationCode: string;
  description?: string;
  
  // Contact
  primaryEmail: string;
  supportEmail?: string;
  phone?: string;
  address?: string;
  country: string; // ISO 3166-1 (e.g., 'CH' for Switzerland)
  
  // Legal
  registrationNumber?: string;
  taxId?: string;
  
  // Branding
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string; // hex
  secondaryColor?: string; // hex
  
  // Academic Calendar
  academicYearStart: string; // ISO date
  academicYearEnd: string; // ISO date
  semesterBreaks?: { start: string; end: string }[];
  
  // Localization
  defaultLanguage: string; // ISO 639-1 (e.g., 'fr', 'de', 'en')
  defaultTimezone: string; // IANA timezone
  defaultCurrency?: string; // ISO 4217
}

export const OrganizationSettingDefinitions: SettingDefinition[] = [
  {
    key: 'organization.name',
    displayName: 'Organization Name',
    category: 'ORGANIZATION',
    accessLevel: 'BASE',
    valueType: 'STRING',
    isRequired: true,
    uiComponent: 'TEXT_INPUT',
  },
  {
    key: 'organization.logo',
    displayName: 'Logo',
    category: 'ORGANIZATION',
    accessLevel: 'BASE',
    valueType: 'FILE',
    isRequired: false,
    uiComponent: 'FILE_UPLOAD',
    uiOptions: {
      accept: 'image/png,image/jpeg,image/svg+xml',
      helpText: 'Recommended size: 200x200px (max 2MB)',
    },
  },
  {
    key: 'organization.primary-color',
    displayName: 'Primary Color',
    category: 'ORGANIZATION',
    accessLevel: 'BASE',
    valueType: 'STRING',
    defaultValue: '#0066cc',
    uiComponent: 'COLOR_PICKER',
  },
  {
    key: 'organization.academic-year-start',
    displayName: 'Academic Year Start',
    category: 'ORGANIZATION',
    accessLevel: 'BASE',
    valueType: 'STRING',
    validators: ['DATE'],
    uiComponent: 'TEXT_INPUT',
    uiOptions: {
      helpText: 'Format: YYYY-MM-DD',
    },
  },
  {
    key: 'organization.default-language',
    displayName: 'Default Language',
    category: 'ORGANIZATION',
    accessLevel: 'BASE',
    valueType: 'ENUM',
    defaultValue: 'fr',
    uiComponent: 'SELECT',
    uiOptions: {
      options: [
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
        { value: 'en', label: 'English' },
        { value: 'it', label: 'Italiano' },
      ],
    },
  },
];
```

### 2. Role Matrix Management UI

```typescript
// src/domains/settings/core/role-matrix-settings.types.ts

export interface RoleHierarchyEntry {
  roleKey: string;
  displayName: string;
  hierarchyLevel: number;
  parentRole?: string;
  
  // Manager capability
  canAssignRoles: boolean;
  canManageUsers: boolean;
  canManageDepartments?: boolean;
  managedRoles: string[]; // Which roles can this role assign?
  
  // Scope capabilities
  scopesManaged: ('TENANT' | 'LEARNING_PATH' | 'COHORT' | 'ONE_TO_ONE')[];
}

export interface RoleMatrixManagement {
  // Role hierarchy
  roles: RoleHierarchyEntry[];
  
  // Manager/Director roles (NEW)
  managerRoles: {
    roleKey: string;
    displayName: string;
    managedRoles: string[];
    permissions: string[];
    reportingLine?: string; // Parent manager role
  }[];
  
  // Customization allowed
  allowCustomRoles: boolean;
  customRoles?: RoleHierarchyEntry[];
  
  // Approval workflows for role changes
  requireApprovalFor: ('ROLE_ASSIGNMENT' | 'PERMISSION_CHANGE' | 'CUSTOM_ROLE_CREATION')[];
}

export const RoleMatrixSettingDefinitions: SettingDefinition[] = [
  {
    key: 'roles.allow-custom-roles',
    displayName: 'Allow Custom Roles',
    category: 'ROLES_PERMISSIONS',
    accessLevel: 'BASE',
    valueType: 'BOOLEAN',
    defaultValue: false,
    uiComponent: 'TOGGLE',
    uiOptions: {
      helpText: 'Allow organization to create custom roles beyond default ones',
    },
  },
  {
    key: 'roles.require-approval-for-assignments',
    displayName: 'Require Approval for Role Assignments',
    category: 'ROLES_PERMISSIONS',
    accessLevel: 'BASE',
    valueType: 'BOOLEAN',
    defaultValue: false,
    uiComponent: 'TOGGLE',
  },
  {
    key: 'roles.manager-roles',
    displayName: 'Manager & Director Roles',
    category: 'ROLES_PERMISSIONS',
    accessLevel: 'ADVANCED',
    valueType: 'JSON',
    uiComponent: 'RICH_EDITOR',
    uiOptions: {
      helpText: 'Define manager/director roles and their authority',
    },
  },
];

// UI Component for Role Matrix Management
export interface RoleMatrixUIComponent {
  // Display hierarchy tree
  roleHierarchyTree: RoleHierarchyEntry[];
  
  // Drag-drop to modify hierarchy
  canReorderRoles: boolean;
  
  // Permission matrix (role × permission)
  permissionMatrix: PermissionMatrixCell[][];
  
  // Manager assignment interface
  managerAssignmentUI: {
    availableManagers: User[];
    selectedManager?: User;
    authorizedRoles: string[];
  };
  
  // Bulk operations
  canBulkAssignRoles: boolean;
  canBulkUpdatePermissions: boolean;
}
```

### 3. Dashboard UI by Role

```typescript
// src/domains/settings/core/dashboard-layouts.types.ts

export interface DashboardLayout {
  roleKey: string;
  displayName: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  isCustomizable: boolean;
}

export type DashboardWidget = 
  | StudentDashboardWidget
  | TeacherDashboardWidget
  | CoachDashboardWidget
  | ManagerDashboardWidget
  | AdminDashboardWidget;

export interface StudentDashboardWidget {
  type: 'STUDENT';
  widgets: (
    | { id: 'my-progress'; label: 'My Progress' }
    | { id: 'upcoming-deadlines'; label: 'Upcoming Deadlines' }
    | { id: 'my-feedback'; label: 'Feedback from Teachers' }
    | { id: 'learning-path'; label: 'Learning Path Overview' }
    | { id: 'competencies'; label: 'Competency Status' }
  )[];
}

export interface TeacherDashboardWidget {
  type: 'TEACHER';
  widgets: (
    | { id: 'my-cohorts'; label: 'My Cohorts' }
    | { id: 'student-progress'; label: 'Student Progress' }
    | { id: 'pending-grades'; label: 'Pending Grades' }
    | { id: 'attendance-summary'; label: 'Attendance Summary' }
    | { id: 'assignments'; label: 'Active Assignments' }
    | { id: 'workflow-tasks'; label: 'Workflow Tasks' }
  )[];
}

export interface CoachDashboardWidget {
  type: 'COACH';
  widgets: (
    | { id: 'my-students'; label: 'My Students' }
    | { id: 'coaching-sessions'; label: 'Coaching Sessions' }
    | { id: 'competency-assessments'; label: 'Competency Assessments' }
    | { id: 'feedback-to-send'; label: 'Feedback to Send' }
  )[];
}

export interface ManagerDashboardWidget {
  type: 'MANAGER';
  widgets: (
    | { id: 'team-overview'; label: 'Team Overview' }
    | { id: 'team-performance'; label: 'Team Performance' }
    | { id: 'role-assignments'; label: 'Role Assignments' }
    | { id: 'pending-approvals'; label: 'Pending Approvals' }
    | { id: 'reports'; label: 'Management Reports' }
    | { id: 'department-health'; label: 'Department Health' }
  )[];
}

export interface AdminDashboardWidget {
  type: 'ADMIN';
  widgets: (
    | { id: 'system-health'; label: 'System Health' }
    | { id: 'user-management'; label: 'User Management' }
    | { id: 'settings-overview'; label: 'Settings Overview' }
    | { id: 'audit-log'; label: 'Audit Log' }
    | { id: 'backup-status'; label: 'Backup Status' }
    | { id: 'security-alerts'; label: 'Security Alerts' }
  )[];
}

export const DashboardSettingDefinitions: SettingDefinition[] = [
  {
    key: 'dashboard.student-layout',
    displayName: 'Student Dashboard Layout',
    category: 'ORGANIZATION',
    accessLevel: 'BASE',
    valueType: 'JSON',
    uiComponent: 'RICH_EDITOR',
  },
  {
    key: 'dashboard.teacher-layout',
    displayName: 'Teacher Dashboard Layout',
    category: 'ORGANIZATION',
    accessLevel: 'BASE',
    valueType: 'JSON',
    uiComponent: 'RICH_EDITOR',
  },
  {
    key: 'dashboard.allow-customization',
    displayName: 'Allow Users to Customize Dashboard',
    category: 'ORGANIZATION',
    accessLevel: 'BASE',
    valueType: 'BOOLEAN',
    defaultValue: true,
    uiComponent: 'TOGGLE',
  },
];
```

---

## Part 3: ADVANCED SETTINGS

### 1. Email Configuration

```typescript
// src/domains/settings/core/email-settings.types.ts

export type EmailProvider = 'SMTP' | 'SENDGRID' | 'AWS_SES' | 'MAILGUN';

export interface EmailSettings {
  provider: EmailProvider;
  isEnabled: boolean;
  
  // SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string; // Encrypted
  smtpUseTLS?: boolean;
  
  // SendGrid
  sendgridApiKey?: string; // Encrypted
  
  // AWS SES
  awsAccessKeyId?: string; // Encrypted
  awsSecretAccessKey?: string; // Encrypted
  awsRegion?: string;
  
  // Mailgun
  mailgunApiKey?: string; // Encrypted
  mailgunDomain?: string;
  
  // General
  senderEmail: string;
  senderName: string;
  replyToEmail?: string;
  
  // Templates
  templates: EmailTemplate[];
  
  // Rate limiting
  maxEmailsPerHour: number;
  maxEmailsPerDay: number;
}

export interface EmailTemplate {
  id: string;
  key: string; // e.g., 'WELCOME_STUDENT', 'ROLE_ASSIGNED'
  name: string;
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  variables: string[]; // {{ firstName }}, {{ cohortName }}
  isActive: boolean;
  language?: string; // For i18n templates
}

export const EmailSettingDefinitions: SettingDefinition[] = [
  {
    key: 'email.provider',
    displayName: 'Email Provider',
    category: 'EMAIL',
    accessLevel: 'BASE',
    valueType: 'ENUM',
    isRequired: true,
    uiComponent: 'SELECT',
    uiOptions: {
      options: [
        { value: 'SMTP', label: 'SMTP Server' },
        { value: 'SENDGRID', label: 'SendGrid' },
        { value: 'AWS_SES', label: 'AWS SES' },
        { value: 'MAILGUN', label: 'Mailgun' },
      ],
    },
  },
  {
    key: 'email.smtp-host',
    displayName: 'SMTP Host',
    category: 'EMAIL',
    accessLevel: 'ADVANCED',
    valueType: 'STRING',
    validators: ['URL'],
    uiComponent: 'TEXT_INPUT',
    uiOptions: {
      placeholder: 'mail.example.com',
      helpText: 'Only shown if SMTP provider is selected',
    },
  },
  {
    key: 'email.smtp-port',
    displayName: 'SMTP Port',
    category: 'EMAIL',
    accessLevel: 'ADVANCED',
    valueType: 'NUMBER',
    defaultValue: 587,
    validators: ['PORT'],
    uiComponent: 'TEXT_INPUT',
  },
  {
    key: 'email.sendgrid-api-key',
    displayName: 'SendGrid API Key',
    category: 'EMAIL',
    accessLevel: 'ADVANCED',
    valueType: 'STRING',
    isEncrypted: true,
    uiComponent: 'TEXT_INPUT',
    uiOptions: {
      placeholder: 'SG.xxxxxxxxxxxxx',
      helpText: 'Only shown if SendGrid is selected. Stored encrypted.',
    },
  },
  {
    key: 'email.sender-email',
    displayName: 'Sender Email Address',
    category: 'EMAIL',
    accessLevel: 'BASE',
    valueType: 'STRING',
    isRequired: true,
    validators: ['EMAIL'],
    uiComponent: 'TEXT_INPUT',
    uiOptions: {
      placeholder: 'noreply@studently.ch',
    },
  },
  {
    key: 'email.sender-name',
    displayName: 'Sender Display Name',
    category: 'EMAIL',
    accessLevel: 'BASE',
    valueType: 'STRING',
    defaultValue: 'Studently',
    uiComponent: 'TEXT_INPUT',
  },
  {
    key: 'email.max-per-hour',
    displayName: 'Max Emails Per Hour',
    category: 'EMAIL',
    accessLevel: 'ADVANCED',
    valueType: 'NUMBER',
    defaultValue: 100,
    uiComponent: 'TEXT_INPUT',
    uiOptions: {
      helpText: 'Rate limiting to prevent bulk sending',
    },
  },
];
```

### 2. Backup & Restore

```typescript
// src/domains/settings/core/backup-settings.types.ts

export type BackupFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type BackupScope = 'DATABASE_ONLY' | 'DATABASE_AND_FILES' | 'FULL';

export interface BackupSettings {
  // Schedule
  isEnabled: boolean;
  frequency: BackupFrequency;
  scheduleTime?: string; // HH:MM (UTC)
  retentionDays: number;
  
  // Scope
  scope: BackupScope;
  excludeUserPhotos: boolean;
  excludeAuditLogs?: boolean;
  
  // Destination
  storageBackend: 'LOCAL' | 'AWS_S3' | 'AZURE_BLOB' | 'GCS';
  
  // AWS S3
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string; // Encrypted
  s3SecretKey?: string; // Encrypted
  
  // Azure
  azureStorageAccount?: string;
  azureAccessKey?: string; // Encrypted
  
  // Google Cloud
  gcsBucket?: string;
  gcsServiceAccount?: string; // Encrypted JSON
  
  // Encryption
  encryptBackups: boolean;
  encryptionKey?: string; // Encrypted
  
  // History
  backups: BackupRecord[];
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  frequency: BackupFrequency;
  size: number; // bytes
  scope: BackupScope;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  location: string;
  retentionUntil: string;
  createdBy?: string;
}

export interface RestoreOperation {
  id: string;
  backupId: string;
  startTime: string;
  estimatedEndTime?: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
  progress: number; // 0-100
  itemsRestored: number;
  errorLog?: string;
}

export const BackupSettingDefinitions: SettingDefinition[] = [
  {
    key: 'backup.enabled',
    displayName: 'Enable Automatic Backups',
    category: 'BACKUP',
    accessLevel: 'ADVANCED',
    valueType: 'BOOLEAN',
    defaultValue: true,
    uiComponent: 'TOGGLE',
    canBeDynamic: true,
  },
  {
    key: 'backup.frequency',
    displayName: 'Backup Frequency',
    category: 'BACKUP',
    accessLevel: 'ADVANCED',
    valueType: 'ENUM',
    defaultValue: 'DAILY',
    uiComponent: 'SELECT',
    uiOptions: {
      options: [
        { value: 'HOURLY', label: 'Hourly' },
        { value: 'DAILY', label: 'Daily' },
        { value: 'WEEKLY', label: 'Weekly' },
        { value: 'MONTHLY', label: 'Monthly' },
      ],
    },
  },
  {
    key: 'backup.retention-days',
    displayName: 'Retention Period (days)',
    category: 'BACKUP',
    accessLevel: 'ADVANCED',
    valueType: 'NUMBER',
    defaultValue: 30,
    uiComponent: 'TEXT_INPUT',
    uiOptions: {
      helpText: 'Delete backups older than this many days',
    },
  },
  {
    key: 'backup.storage-backend',
    displayName: 'Storage Backend',
    category: 'BACKUP',
    accessLevel: 'ADVANCED',
    valueType: 'ENUM',
    defaultValue: 'LOCAL',
    uiComponent: 'SELECT',
    uiOptions: {
      options: [
        { value: 'LOCAL', label: 'Local Storage' },
        { value: 'AWS_S3', label: 'AWS S3' },
        { value: 'AZURE_BLOB', label: 'Azure Blob Storage' },
        { value: 'GCS', label: 'Google Cloud Storage' },
      ],
    },
  },
  {
    key: 'backup.encrypt-backups',
    displayName: 'Encrypt Backups',
    category: 'BACKUP',
    accessLevel: 'ADVANCED',
    valueType: 'BOOLEAN',
    defaultValue: true,
    uiComponent: 'TOGGLE',
    uiOptions: {
      helpText: 'AES-256 encryption for backup data',
    },
  },
];
```

### 3. Data Privacy (Anonymization & Encryption)

```typescript
// src/domains/settings/core/privacy-settings.types.ts

export interface PrivacySettings {
  // GDPR Compliance
  gdprEnabled: boolean;
  
  // Data Anonymization
  anonymization: {
    enabled: boolean;
    retentionMonths: number; // After this, data is anonymized
    fields: AnonymizationRule[];
  };
  
  // Encryption
  encryption: {
    databaseEncryption: boolean;
    fileEncryption: boolean;
    encryptionAlgorithm: 'AES-256' | 'AES-192' | 'AES-128';
    keyRotationDays: number;
  };
  
  // Data Export
  allowDataExport: boolean;
  exportFormats: ('CSV' | 'JSON' | 'PDF')[];
  
  // Cookie Consent
  cookieConsent: {
    required: boolean;
    consentTypes: ('ESSENTIAL' | 'ANALYTICS' | 'MARKETING')[];
  };
  
  // Data Deletion
  autoDeleteInactiveUsers: boolean;
  autoDeleteInactiveMonths?: number;
  
  // PII Masking
  maskPIIInLogs: boolean;
  piiFields: string[]; // e.g., 'email', 'phone', 'ssn'
}

export type AnonymizationStrategy = 'HASH' | 'REDACT' | 'GENERALIZE' | 'ENCRYPT' | 'DELETE';

export interface AnonymizationRule {
  fieldName: string;
  tableName: string;
  strategy: AnonymizationStrategy;
  preservePattern?: string; // For partial redaction
}

export const PrivacySettingDefinitions: SettingDefinition[] = [
  {
    key: 'privacy.gdpr-enabled',
    displayName: 'Enable GDPR Compliance',
    category: 'PRIVACY',
    accessLevel: 'ADVANCED',
    valueType: 'BOOLEAN',
    defaultValue: true,
    uiComponent: 'TOGGLE',
    uiOptions: {
      helpText: 'Enable GDPR-compliant features (right to be forgotten, data export)',
    },
  },
  {
    key: 'privacy.anonymization-enabled',
    displayName: 'Enable Data Anonymization',
    category: 'PRIVACY',
    accessLevel: 'ADVANCED',
    valueType: 'BOOLEAN',
    defaultValue: false,
    uiComponent: 'TOGGLE',
    uiOptions: {
      helpText: 'Automatically anonymize data after retention period',
    },
  },
  {
    key: 'privacy.retention-months',
    displayName: 'Data Retention Period (months)',
    category: 'PRIVACY',
    accessLevel: 'ADVANCED',
    valueType: 'NUMBER',
    defaultValue: 36,
    uiComponent: 'TEXT_INPUT',
    uiOptions: {
      helpText: 'After this period, personal data is anonymized',
    },
  },
  {
    key: 'privacy.encryption-algorithm',
    displayName: 'Encryption Algorithm',
    category: 'PRIVACY',
    accessLevel: 'ADVANCED',
    valueType: 'ENUM',
    defaultValue: 'AES-256',
    uiComponent: 'SELECT',
    uiOptions: {
      options: [
        { value: 'AES-256', label: 'AES-256 (strongest)' },
        { value: 'AES-192', label: 'AES-192' },
        { value: 'AES-128', label: 'AES-128 (legacy)' },
      ],
    },
  },
  {
    key: 'privacy.mask-pii-in-logs',
    displayName: 'Mask PII in Logs',
    category: 'PRIVACY',
    accessLevel: 'ADVANCED',
    valueType: 'BOOLEAN',
    defaultValue: true,
    uiComponent: 'TOGGLE',
    uiOptions: {
      helpText: 'Automatically redact personal information from audit logs',
    },
  },
];
```

### 4. Asset Management

```typescript
// src/domains/settings/core/asset-settings.types.ts

export type AssetCategory = 'LOGO' | 'BANNER' | 'ICON' | 'PDF_TEMPLATE' | 'DOCUMENT';

export interface AssetSettings {
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
  storageBackend: 'LOCAL' | 'AWS_S3' | 'AZURE_BLOB' | 'GCS';
  
  // Logos
  logos: {
    organization: Asset;
    favicon: Asset;
    whiteLogo?: Asset;
    darkLogo?: Asset;
  };
  
  // Banners
  banners: {
    loginBanner?: Asset;
    dashboardBanner?: Asset;
    emailHeader?: Asset;
  };
  
  // PDF Templates
  pdfTemplates: PDFTemplate[];
  
  // Asset Library
  assets: Asset[];
  
  // CDN
  cdnEnabled: boolean;
  cdnUrl?: string;
}

export interface Asset {
  id: string;
  key: string; // e.g., 'logo-organization'
  category: AssetCategory;
  filename: string;
  url: string; // Served from storage or CDN
  mimeType: string;
  size: number; // bytes
  width?: number; // For images
  height?: number; // For images
  uploadedAt: string;
  uploadedBy: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  key: string; // e.g., 'certificate', 'transcript'
  htmlContent: string;
  css?: string;
  variables: string[]; // {{ firstName }}, {{ date }}
  isActive: boolean;
}

export const AssetSettingDefinitions: SettingDefinition[] = [
  {
    key: 'assets.organization-logo',
    displayName: 'Organization Logo',
    category: 'ASSETS',
    accessLevel: 'BASE',
    valueType: 'FILE',
    uiComponent: 'FILE_UPLOAD',
    uiOptions: {
      accept: 'image/png,image/jpeg,image/svg+xml',
      helpText: 'Recommended: 200x200px, PNG or SVG (max 2MB)',
    },
  },
  {
    key: 'assets.favicon',
    displayName: 'Favicon',
    category: 'ASSETS',
    accessLevel: 'BASE',
    valueType: 'FILE',
    uiComponent: 'FILE_UPLOAD',
    uiOptions: {
      accept: 'image/x-icon,image/png',
      helpText: '32x32px favicon.ico or PNG',
    },
  },
  {
    key: 'assets.login-banner',
    displayName: 'Login Page Banner',
    category: 'ASSETS',
    accessLevel: 'BASE',
    valueType: 'FILE',
    uiComponent: 'FILE_UPLOAD',
  },
  {
    key: 'assets.max-file-size',
    displayName: 'Max File Size (MB)',
    category: 'ASSETS',
    accessLevel: 'ADVANCED',
    valueType: 'NUMBER',
    defaultValue: 10,
    uiComponent: 'TEXT_INPUT',
  },
];
```

---

## Part 4: SYSTEM SETTINGS

### 1. Internationalization (i18n)

```typescript
// src/domains/settings/core/i18n-settings.types.ts

export type Language = 'fr' | 'de' | 'it' | 'en' | 'es' | 'pt';

export interface I18nSettings {
  // Supported Languages
  supportedLanguages: SupportedLanguage[];
  defaultLanguage: Language;
  
  // Translations
  translations: TranslationKey[];
  
  // Localization
  dateFormat: 'DD.MM.YYYY' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '24H' | '12H';
  numberFormat: {
    decimalSeparator: '.' | ',';
    thousandsSeparator: ',' | '.';
    currency: string; // CHF, EUR, etc.
  };
}

export interface SupportedLanguage {
  code: Language;
  name: string;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  completionPercentage: number; // Translation coverage %
}

export interface TranslationKey {
  key: string; // e.g., 'dashboard.welcome'
  category: string; // e.g., 'dashboard', 'emails', 'errors'
  translations: Record<Language, string>;
  context?: string; // For translators
  isUsed: boolean;
}

export const I18nSettingDefinitions: SettingDefinition[] = [
  {
    key: 'i18n.default-language',
    displayName: 'Default Language',
    category: 'I18N',
    accessLevel: 'SYSTEM',
    scope: 'SYSTEM',
    valueType: 'ENUM',
    defaultValue: 'fr',
    uiComponent: 'SELECT',
    uiOptions: {
      options: [
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
        { value: 'it', label: 'Italiano' },
        { value: 'en', label: 'English' },
      ],
    },
  },
  {
    key: 'i18n.supported-languages',
    displayName: 'Supported Languages',
    category: 'I18N',
    accessLevel: 'SYSTEM',
    scope: 'SYSTEM',
    valueType: 'JSON',
    uiComponent: 'RICH_EDITOR',
    uiOptions: {
      helpText: 'Select which languages are available to users',
    },
  },
  {
    key: 'i18n.date-format',
    displayName: 'Date Format',
    category: 'I18N',
    accessLevel: 'SYSTEM',
    scope: 'SYSTEM',
    valueType: 'ENUM',
    defaultValue: 'DD.MM.YYYY',
    uiComponent: 'SELECT',
    uiOptions: {
      options: [
        { value: 'DD.MM.YYYY', label: '25.03.2026 (Swiss)' },
        { value: 'DD/MM/YYYY', label: '25/03/2026' },
        { value: 'MM/DD/YYYY', label: '03/25/2026 (US)' },
        { value: 'YYYY-MM-DD', label: '2026-03-25 (ISO)' },
      ],
    },
  },
];
```

### 2. Theming

```typescript
// src/domains/settings/core/theme-settings.types.ts

export interface ThemeSettings {
  currentTheme: 'LIGHT' | 'DARK' | 'AUTO';
  
  // Color Palette
  colors: {
    primary: string; // hex
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
  
  // Typography
  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
    };
    fontWeight: {
      light: number;
      normal: number;
      semibold: number;
      bold: number;
    };
  };
  
  // Spacing
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  // Border Radius
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  
  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  
  // Branding
  logoUrl: string;
  logoHeight: number;
  brandName: string;
}

export const ThemeSettingDefinitions: SettingDefinition[] = [
  {
    key: 'theme.current-theme',
    displayName: 'Theme Mode',
    category: 'THEME',
    accessLevel: 'BASE',
    valueType: 'ENUM',
    defaultValue: 'AUTO',
    uiComponent: 'SELECT',
    canBeDynamic: true,
    uiOptions: {
      options: [
        { value: 'LIGHT', label: 'Light' },
        { value: 'DARK', label: 'Dark' },
        { value: 'AUTO', label: 'Auto (System)' },
      ],
    },
  },
  {
    key: 'theme.primary-color',
    displayName: 'Primary Color',
    category: 'THEME',
    accessLevel: 'BASE',
    valueType: 'STRING',
    defaultValue: '#0066cc',
    uiComponent: 'COLOR_PICKER',
    canBeDynamic: true,
  },
  {
    key: 'theme.secondary-color',
    displayName: 'Secondary Color',
    category: 'THEME',
    accessLevel: 'BASE',
    valueType: 'STRING',
    defaultValue: '#00cc66',
    uiComponent: 'COLOR_PICKER',
    canBeDynamic: true,
  },
  {
    key: 'theme.font-family',
    displayName: 'Font Family',
    category: 'THEME',
    accessLevel: 'ADVANCED',
    valueType: 'STRING',
    defaultValue: 'Inter, sans-serif',
    uiComponent: 'SELECT',
    canBeDynamic: true,
    uiOptions: {
      options: [
        { value: 'Inter, sans-serif', label: 'Inter' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Georgia, serif', label: 'Georgia' },
      ],
    },
  },
];
```

---

## Part 5: Database Schema

```sql
-- Settings Definition
CREATE TABLE setting_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  -- Identity
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Classification
  category VARCHAR(100) NOT NULL,
  access_level VARCHAR(50) NOT NULL, -- BASE, ADVANCED, SYSTEM
  scope VARCHAR(50) NOT NULL, -- TENANT, SYSTEM
  
  -- Metadata
  value_type VARCHAR(50) NOT NULL,
  default_value JSONB,
  is_required BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT false,
  
  -- UI
  ui_component VARCHAR(100) NOT NULL,
  ui_options JSONB,
  
  -- Validation
  validators TEXT[],
  custom_validation_schema JSONB,
  
  -- Permissions
  required_permission VARCHAR(255),
  can_be_dynamic BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL
);

-- Setting Values (per tenant)
CREATE TABLE setting_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  setting_key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  previous_value JSONB,
  
  -- Audit
  modified_by UUID NOT NULL,
  modified_at TIMESTAMP NOT NULL,
  change_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, setting_key),
  FOREIGN KEY(setting_key) REFERENCES setting_definitions(setting_key),
  INDEX idx_setting_values_tenant (tenant_id)
);

-- Settings Audit Log
CREATE TABLE settings_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  setting_key VARCHAR(255) NOT NULL,
  
  action VARCHAR(50) NOT NULL, -- READ, CREATE, UPDATE, DELETE
  old_value JSONB,
  new_value JSONB,
  
  modified_by UUID NOT NULL,
  modified_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  INDEX idx_audit_tenant (tenant_id),
  INDEX idx_audit_setting (setting_key),
  INDEX idx_audit_modified_at (modified_at)
);

-- Role Matrix
CREATE TABLE role_matrix_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  role_key VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  hierarchy_level SMALLINT NOT NULL,
  parent_role VARCHAR(100),
  
  can_assign_roles BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  can_manage_departments BOOLEAN DEFAULT false,
  
  managed_roles TEXT[],
  managed_scopes TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, role_key)
);

-- Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  asset_key VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  
  uploaded_at TIMESTAMP NOT NULL,
  uploaded_by UUID NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, asset_key),
  INDEX idx_assets_category (category)
);

-- Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  template_key VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_body TEXT NOT NULL,
  plain_text_body TEXT,
  variables TEXT[],
  
  is_active BOOLEAN DEFAULT true,
  language VARCHAR(10),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, template_key, language),
  INDEX idx_templates_language (language)
);

-- Backup Records
CREATE TABLE backup_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  timestamp TIMESTAMP NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  size BIGINT NOT NULL,
  scope VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  location TEXT NOT NULL,
  retention_until DATE NOT NULL,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_backups_timestamp (timestamp),
  INDEX idx_backups_status (status)
);
```

---

## Part 6: Settings Service Implementation

```typescript
// src/domains/settings/core/settings-service.ts

export const SettingsService = function(
  settingsRepository: ISettingsRepository,
  settingsAuditLog: ISettingsAuditLog,
  eventEmitter: IEventEmitter,
) {
  const getSetting = async (
    tenantId: string,
    settingKey: string,
  ): Promise<any> => {
    const definition = await settingsRepository.getDefinition(settingKey);
    if (!definition) throw new Error('Setting not found');

    const value = await settingsRepository.getValue(tenantId, settingKey);
    return value?.value ?? definition.defaultValue;
  };

  const updateSetting = async (
    tenantId: string,
    settingKey: string,
    newValue: any,
    userId: string,
    reason?: string,
  ): Promise<void> => {
    // Get definition
    const definition = await settingsRepository.getDefinition(settingKey);
    if (!definition) throw new Error('Setting not found');

    // Validate
    if (definition.validators) {
      for (const validator of definition.validators) {
        validateSetting(newValue, validator);
      }
    }

    // Get old value
    const oldValue = await settingsRepository.getValue(tenantId, settingKey);

    // Encrypt if needed
    const valueToStore = definition.isEncrypted
      ? await encryptValue(newValue)
      : newValue;

    // Store
    await settingsRepository.setValue(tenantId, settingKey, valueToStore);

    // Audit log
    await settingsAuditLog.log({
      tenantId,
      settingKey,
      action: 'UPDATE',
      oldValue: oldValue?.value,
      newValue,
      modifiedBy: userId,
      reason,
    });

    // Emit event for live updates (if canBeDynamic)
    if (definition.canBeDynamic) {
      await eventEmitter.emit('SettingUpdated', {
        tenantId,
        settingKey,
        newValue,
      });
    }
  };

  const getSettingsByCategory = async (
    tenantId: string,
    category: string,
    accessLevel?: string,
  ): Promise<SettingWithValue[]> => {
    const definitions = await settingsRepository.getDefinitions(
      category,
      accessLevel,
    );

    const settings = await Promise.all(
      definitions.map(async def => {
        const value = await settingsRepository.getValue(tenantId, def.key);
        return {
          definition: def,
          value: value?.value ?? def.defaultValue,
        };
      }),
    );

    return settings;
  };

  const getSettingsByAccessLevel = async (
    tenantId: string,
    accessLevel: 'BASE' | 'ADVANCED' | 'SYSTEM',
  ): Promise<SettingsByCategory[]> => {
    const definitions = await settingsRepository.getDefinitions(
      undefined,
      accessLevel,
    );

    const grouped = definitions.reduce((acc, def) => {
      const category = acc.find(c => c.name === def.category);
      if (!category) {
        acc.push({
          name: def.category,
          settings: [def],
        });
      } else {
        category.settings.push(def);
      }
      return acc;
    }, [] as SettingsByCategory[]);

    return grouped;
  };

  return {
    getSetting,
    updateSetting,
    getSettingsByCategory,
    getSettingsByAccessLevel,
  };
};
```

---

## Part 7: UI Component Structure

```typescript
// src/domains/settings/presentation/settings-page.types.ts

export interface SettingsPageLayout {
  // Sidebar Navigation
  sidebar: {
    categories: SettingCategory[];
    activeCategory: string;
  };

  // Main Content
  content: {
    categoryTitle: string;
    categoryDescription?: string;
    settings: SettingWidget[];
    isDirty: boolean; // Unsaved changes
  };

  // Action Buttons
  actions: {
    save: {
      enabled: boolean;
      loading: boolean;
    };
    reset: {
      enabled: boolean;
    };
    preview?: {
      enabled: boolean; // For theme settings
    };
  };
}

export type SettingWidget =
  | TextSettingWidget
  | SelectSettingWidget
  | ToggleSettingWidget
  | FileUploadWidget
  | ColorPickerWidget
  | RichEditorWidget
  | DatePickerWidget;

export interface SettingWidgetBase {
  key: string;
  label: string;
  helpText?: string;
  value: any;
  isRequired: boolean;
  isReadOnly: boolean;
  isChanged: boolean;
  error?: string;
}

export interface TextSettingWidget extends SettingWidgetBase {
  type: 'TEXT_INPUT';
  placeholder?: string;
  maxLength?: number;
}

export interface SelectSettingWidget extends SettingWidgetBase {
  type: 'SELECT';
  options: { value: string; label: string }[];
}

export interface ToggleSettingWidget extends SettingWidgetBase {
  type: 'TOGGLE';
  enabledLabel?: string;
  disabledLabel?: string;
}

export interface FileUploadWidget extends SettingWidgetBase {
  type: 'FILE_UPLOAD';
  accept: string;
  maxSize?: number;
  preview?: string;
}

export interface ColorPickerWidget extends SettingWidgetBase {
  type: 'COLOR_PICKER';
  presetColors?: string[];
}

export interface RichEditorWidget extends SettingWidgetBase {
  type: 'RICH_EDITOR';
  height?: number;
}

export interface DatePickerWidget extends SettingWidgetBase {
  type: 'DATE_PICKER';
}
```

---

## Summary: Settings Breakdown

### **BASE SETTINGS** (Tenant Admin - Self-Service)
- Organization Profile (Name, Logo, Colors, Address)
- Dashboard Layouts (Per-role customization)
- Theme (Light/Dark/Auto, Colors)
- Email Configuration (Provider selection, basic setup)
- Basic Role Matrix

### **ADVANCED SETTINGS** (System Admin - Technical)
- Email Templates & Advanced SMTP
- Backup & Restore Configuration
- Data Privacy & Anonymization
- Asset Management (Logos, Banners, PDFs)
- AI Provider Configuration
- Compliance Settings
- Advanced Role Matrix (Manager/Director roles)

### **SYSTEM SETTINGS** (System Admin - Platform-wide)
- Internationalization (Supported languages, formats)
- Security Policies
- Rate Limiting
- Audit Log Retention

---

**Version**: 1.0  
**Status**: Ready for Implementation  
**Last Updated**: March 17, 2026
