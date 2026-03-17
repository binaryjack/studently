# Workflow Engine & State Machine

## Overview
The Workflow Engine is a generic, flexible orchestration system that manages multi-step business processes including approvals, AI processing, document generation, web search, and integrations. It supports complex workflows with conditional transitions, parallel actions, timeouts, and escalation chains.

## Architecture

### Core Components

```
┌────────────────────────────────────────────────────────────┐
│                   Workflow Engine                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │  Workflow    │      │  Workflow    │                   │
│  │  Definition  │─────►│  Execution   │                   │
│  └──────────────┘      └──────┬───────┘                   │
│                               │                            │
│                               ▼                            │
│                      ┌──────────────┐                      │
│                      │    State     │                      │
│                      │   Machine    │                      │
│                      └──────┬───────┘                      │
│                             │                              │
│          ┌──────────────────┼──────────────────┐           │
│          ▼                  ▼                  ▼           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Actions    │  │ Transitions  │  │  Conditions  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
           │                   │                   │
           ▼                   ▼                   ▼
    ┌───────────┐      ┌───────────┐      ┌───────────┐
    │ AI Agents │      │   Email   │      │  Webhooks │
    └───────────┘      └───────────┘      └───────────┘
```

### Feature Slice Structure

```
packages/workflow-engine/
├── src/
│   ├── features/
│   │   ├── workflow/
│   │   │   ├── api/
│   │   │   │   ├── workflow.controller.ts
│   │   │   │   └── workflow.routes.ts
│   │   │   ├── model/
│   │   │   │   ├── workflow-definition.ts
│   │   │   │   ├── workflow-execution.ts
│   │   │   │   └── workflow-types.ts
│   │   │   ├── lib/
│   │   │   │   ├── workflow.service.ts
│   │   │   │   ├── workflow.repository.ts
│   │   │   │   └── state-machine.ts
│   │   │   └── ui/ (if frontend components)
│   │   │
│   │   ├── actions/
│   │   │   ├── ai-action/
│   │   │   │   ├── ai-action.service.ts
│   │   │   │   └── ai-action.types.ts
│   │   │   ├── email-action/
│   │   │   ├── approval-action/
│   │   │   └── ...
│   │   │
│   │   └── conditions/
│   │       ├── expression-evaluator.ts
│   │       └── condition.types.ts
│   │
│   └── index.ts
└── package.json
```

## Core Entities

### WorkflowDefinition

```typescript
import { BaseEntity, TranslatableEntity } from '../base-interfaces';

/**
 * Workflow template/definition
 */
export interface WorkflowDefinition extends TranslatableEntity {
  // Inherits: id, sequence, code, order, language, name, description
  
  /**
   * Category for grouping workflows
   */
  categoryCode: string; // 'approval', 'document-generation', 'onboarding', etc.
  
  /**
   * Version of workflow definition
   */
  version: number;
  
  /**
   * Is this the active version?
   */
  isActiveVersion: boolean;
  
  /**
   * State definitions
   */
  states: StateDefinition[];
  
  /**
   * Transition definitions
   */
  transitions: TransitionDefinition[];
  
  /**
   * Initial state code
   */
  initialStateCode: string;
  
  /**
   * Final/terminal states
   */
  terminalStateCodes: string[];
  
  /**
   * Timeout configuration
   */
  timeoutMinutes?: number; // Global workflow timeout
  
  /**
   * Escalation chain
   */
  escalationChain?: {
    afterMinutes: number;
    escalateToUserId: string;
  }[];
  
  /**
   * Metadata schema
   * Defines expected payload structure
   */
  payloadSchema?: Record<string, any>; // JSON Schema
  
  /**
   * Can this workflow be instantiated manually?
   */
  isManuallyTriggerable: boolean;
  
  /**
   * Auto-trigger configuration
   */
  triggers?: {
    eventType: string; // 'student.created', 'timesheet.submitted', etc.
    condition?: string; // Expression to evaluate
  }[];
}
```

### StateDefinition

```typescript
/**
 * Individual state in a workflow
 */
export interface StateDefinition {
  /**
   * State code (unique within workflow)
   */
  code: string;
  
  /**
   * Display name (translatable via translations table)
   */
  nameKey: string;
  
  /**
   * State type
   */
  type: 'START' | 'INTERMEDIATE' | 'APPROVAL' | 'AI_PROCESSING' | 'WAITING' | 'END' | 'ERROR';
  
  /**
   * Actions to execute when entering this state
   */
  onEnterActions?: ActionDefinition[];
  
  /**
   * Actions to execute when exiting this state
   */
  onExitActions?: ActionDefinition[];
  
  /**
   * Timeout for this state
   */
  timeoutMinutes?: number;
  
  /**
   * State to transition to on timeout
   */
  timeoutTransitionToState?: string;
  
  /**
   * Is this a terminal state?
   */
  isTerminal: boolean;
  
  /**
   * UI metadata (position in diagram, color, etc.)
   */
  uiMetadata?: {
    x: number;
    y: number;
    color?: string;
    icon?: string;
  };
}
```

### TransitionDefinition

```typescript
/**
 * Transition between states
 */
export interface TransitionDefinition {
  /**
   * Transition code (unique within workflow)
   */
  code: string;
  
  /**
   * Display name
   */
  nameKey: string;
  
  /**
   * Source state code
   */
  fromStateCode: string;
  
  /**
   * Target state code
   */
  toStateCode: string;
  
  /**
   * Conditions that must be met for transition
   */
  conditions?: ConditionDefinition[];
  
  /**
   * Actions to execute during transition
   */
  actions?: ActionDefinition[];
  
  /**
   * Required role to execute this transition
   */
  requiredRole?: string;
  
  /**
   * Is this an automatic transition?
   * If true, executes immediately when conditions are met
   */
  isAutomatic: boolean;
  
  /**
   * Priority (for multiple valid transitions)
   */
  priority: number;
}
```

### ActionDefinition

```typescript
/**
 * Action types supported by workflow engine
 */
export enum ActionType {
  // AI Actions
  AI_ANALYZE = 'AI_ANALYZE',                   // Generic AI analysis
  AI_EXTRACT = 'AI_EXTRACT',                   // Extract structured data
  AI_CLASSIFY = 'AI_CLASSIFY',                 // Classify/categorize content
  AI_GENERATE = 'AI_GENERATE',                 // Generate text/content
  AI_TRANSLATE = 'AI_TRANSLATE',               // Translate content
  AI_SUMMARIZE = 'AI_SUMMARIZE',               // Summarize document
  AI_EVALUATE = 'AI_EVALUATE',                 // Evaluate/score content
  
  // Communication Actions
  EMAIL_SEND = 'EMAIL_SEND',                   // Send email
  SMS_SEND = 'SMS_SEND',                       // Send SMS
  NOTIFICATION_PUSH = 'NOTIFICATION_PUSH',     // Push notification
  
  // Document Actions
  DOC_GENERATE = 'DOC_GENERATE',               // Generate document (PDF, Word)
  DOC_CONVERT = 'DOC_CONVERT',                 // Convert document format
  DOC_MERGE = 'DOC_MERGE',                     // Merge multiple documents
  DOC_SIGN = 'DOC_SIGN',                       // Digital signature
  DOC_VERSION = 'DOC_VERSION',                 // Create new version
  
  // Web Actions
  WEB_SEARCH = 'WEB_SEARCH',                   // Search web
  WEB_SCRAPE = 'WEB_SCRAPE',                   // Scrape web page
  API_CALL = 'API_CALL',                       // Call external API
  WEBHOOK_SEND = 'WEBHOOK_SEND',               // Send webhook
  
  // Approval Actions
  APPROVAL_REQUEST = 'APPROVAL_REQUEST',       // Request approval
  APPROVAL_NOTIFY = 'APPROVAL_NOTIFY',         // Notify approver
  APPROVAL_ESCALATE = 'APPROVAL_ESCALATE',     // Escalate to next level
  
  // Data Actions
  DATA_VALIDATE = 'DATA_VALIDATE',             // Validate data
  DATA_TRANSFORM = 'DATA_TRANSFORM',           // Transform data
  DATA_SAVE = 'DATA_SAVE',                     // Save to database
  DATA_DELETE = 'DATA_DELETE',                 // Delete from database
  
  // Integration Actions
  CRM_UPDATE = 'CRM_UPDATE',                   // Update CRM record
  CALENDAR_CREATE = 'CALENDAR_CREATE',         // Create calendar event
  SLACK_MESSAGE = 'SLACK_MESSAGE',             // Send Slack message
  
  // Workflow Actions
  WORKFLOW_START = 'WORKFLOW_START',           // Start child workflow
  WORKFLOW_WAIT = 'WORKFLOW_WAIT',             // Wait for external event
  WORKFLOW_BRANCH = 'WORKFLOW_BRANCH',         // Parallel execution
  
  // Custom
  CUSTOM = 'CUSTOM',                           // Custom action handler
}

/**
 * Action definition with configuration
 */
export interface ActionDefinition {
  /**
   * Action type
   */
  type: ActionType;
  
  /**
   * Action configuration (type-specific)
   */
  config: Record<string, any>;
  
  /**
   * Retry configuration
   */
  retry?: {
    maxAttempts: number;
    delaySeconds: number;
    backoffMultiplier?: number; // Exponential backoff
  };
  
  /**
   * Timeout for action execution
   */
  timeoutSeconds?: number;
  
  /**
   * Continue on error?
   */
  continueOnError: boolean;
  
  /**
   * Conditional execution
   */
  condition?: string; // Expression to evaluate
}
```

### ConditionDefinition

```typescript
/**
 * Condition for transition guards
 */
export interface ConditionDefinition {
  /**
   * Field path in workflow payload
   * Supports dot notation: 'payload.student.status'
   */
  field: string;
  
  /**
   * Operator
   */
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'regex' | 'exists' | 'custom';
  
  /**
   * Value to compare against
   */
  value: any;
  
  /**
   * Custom expression (for complex logic)
   * Uses safe expression language (e.g., JSONLogic)
   */
  expression?: string;
}
```

### WorkflowExecution

```typescript
import { BaseEntity } from '../base-interfaces';

/**
 * Workflow execution instance
 */
export interface WorkflowExecution extends BaseEntity {
  // Inherits: id, sequence, code, tenantId, createdAt, updatedAt
  
  /**
   * Reference to workflow definition
   */
  workflowDefinitionId: string;
  workflowDefinitionCode: string;
  workflowDefinitionVersion: number;
  
  /**
   * Current state
   */
  currentStateCode: string;
  
  /**
   * Execution status
   */
  status: 'RUNNING' | 'WAITING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';
  
  /**
   * Payload data (flexible schema)
   */
  payload: {
    /**
     * Documents attached to workflow
     */
    documents?: {
      id: string;
      url: string;
      name: string;
      mimeType: string;
    }[];
    
    /**
     * Images/scans
     */
    images?: {
      id: string;
      url: string;
      description?: string;
    }[];
    
    /**
     * Links/URLs
     */
    links?: {
      url: string;
      title?: string;
      description?: string;
    }[];
    
    /**
     * Custom metadata (entity-specific)
     */
    metadata?: Record<string, any>;
    
    /**
     * Text content
     */
    text?: string;
    
    /**
     * Extracted/generated data from AI
     */
    aiData?: Record<string, any>;
  };
  
  /**
   * Context variables (accumulated during execution)
   */
  context: Record<string, any>;
  
  /**
   * Execution history
   */
  history: WorkflowHistoryEntry[];
  
  /**
   * Started by user
   */
  startedByUserId: string;
  
  /**
   * Started at
   */
  startedAt: string; // ISO 8601
  
  /**
   * Completed at
   */
  completedAt?: string; // ISO 8601
  
  /**
   * Failed at
   */
  failedAt?: string; // ISO 8601
  
  /**
   * Error message
   */
  errorMessage?: string;
  
  /**
   * Related entity
   */
  relatedEntityType?: string; // 'student', 'timesheet', etc.
  relatedEntityId?: string;
  
  /**
   * Parent workflow (if child)
   */
  parentWorkflowExecutionId?: string;
  
  /**
   * Priority
   */
  priority: number; // 1-10 (10 = highest)
  
  /**
   * Tags for filtering
   */
  tags?: string[];
}
```

### WorkflowHistoryEntry

```typescript
/**
 * History entry for workflow execution audit trail
 */
export interface WorkflowHistoryEntry {
  /**
   * Timestamp
   */
  timestamp: string; // ISO 8601
  
  /**
   * Event type
   */
  eventType: 'STATE_ENTERED' | 'STATE_EXITED' | 'TRANSITION_EXECUTED' | 'ACTION_STARTED' | 'ACTION_COMPLETED' | 'ACTION_FAILED' | 'APPROVAL_REQUESTED' | 'APPROVAL_GRANTED' | 'APPROVAL_REJECTED' | 'WORKFLOW_FAILED' | 'WORKFLOW_COMPLETED';
  
  /**
   * State code (if applicable)
   */
  stateCode?: string;
  
  /**
   * Transition code (if applicable)
   */
  transitionCode?: string;
  
  /**
   * Action type (if applicable)
   */
  actionType?: ActionType;
  
  /**
   * User who triggered event
   */
  userId?: string;
  
  /**
   * Event details
   */
  details: Record<string, any>;
  
  /**
   * Duration (for actions)
   */
  durationMs?: number;
}
```

## AI Integration

### AI Action Configuration

```typescript
/**
 * Configuration for AI_ANALYZE action
 */
export interface AiAnalyzeConfig {
  /**
   * AI provider to use
   */
  provider: 'openai' | 'anthropic' | 'azure-openai' | 'custom';
  
  /**
   * Model name
   */
  model: string; // 'gpt-4', 'claude-3-opus', etc.
  
  /**
   * Prompt template code
   */
  promptTemplateCode: string;
  
  /**
   * Input field from payload
   */
  inputField: string; // Path to text in payload
  
  /**
   * Output field in context
   */
  outputField: string; // Where to store result
  
  /**
   * Max tokens
   */
  maxTokens?: number;
  
  /**
   * Temperature
   */
  temperature?: number;
  
  /**
   * Response format
   */
  responseFormat?: 'text' | 'json' | 'structured';
  
  /**
   * JSON schema for structured output
   */
  jsonSchema?: Record<string, any>;
}

/**
 * Example AI action definition
 */
const cvAnalysisAction: ActionDefinition = {
  type: ActionType.AI_ANALYZE,
  config: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    promptTemplateCode: 'cv-skills-extraction',
    inputField: 'payload.documents[0].extractedText',
    outputField: 'context.extractedSkills',
    temperature: 0.3,
    responseFormat: 'json',
    jsonSchema: {
      type: 'object',
      properties: {
        skills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              category: { type: 'string' },
              proficiencyLevel: { type: 'string' },
            },
          },
        },
      },
    },
  },
  retry: {
    maxAttempts: 3,
    delaySeconds: 2,
    backoffMultiplier: 2,
  },
  timeoutSeconds: 30,
  continueOnError: false,
};
```

## Complete Workflow Examples

### Example 1: CV Approval Workflow

```typescript
const cvApprovalWorkflow: WorkflowDefinition = {
  id: 'wf-001',
  sequence: 1,
  code: 'cv-approval',
  order: 1,
  language: 'en',
  name: 'CV Approval Workflow',
  description: 'Review and approve student CV with AI assistance',
  tenantId: 'tenant-001',
  createdAt: '2026-03-17T10:00:00Z',
  updatedAt: '2026-03-17T10:00:00Z',
  createdBy: 'user-001',
  updatedBy: 'user-001',
  
  categoryCode: 'document-approval',
  version: 1,
  isActiveVersion: true,
  isActive: true,
  
  states: [
    {
      code: 'start',
      nameKey: 'workflow.state.start',
      type: 'START',
      isTerminal: false,
      uiMetadata: { x: 100, y: 100 },
    },
    {
      code: 'ai-analysis',
      nameKey: 'workflow.state.ai-analysis',
      type: 'AI_PROCESSING',
      onEnterActions: [
        {
          type: ActionType.AI_EXTRACT,
          config: {
            provider: 'openai',
            model: 'gpt-4-turbo',
            promptTemplateCode: 'cv-extraction',
            inputField: 'payload.documents[0].extractedText',
            outputField: 'context.cvData',
            responseFormat: 'json',
          },
          continueOnError: false,
        },
        {
          type: ActionType.AI_EVALUATE,
          config: {
            provider: 'openai',
            model: 'gpt-4',
            promptTemplateCode: 'cv-quality-check',
            inputField: 'context.cvData',
            outputField: 'context.qualityScore',
          },
          continueOnError: true,
        },
      ],
      isTerminal: false,
      timeoutMinutes: 5,
      uiMetadata: { x: 300, y: 100 },
    },
    {
      code: 'pending-review',
      nameKey: 'workflow.state.pending-review',
      type: 'APPROVAL',
      onEnterActions: [
        {
          type: ActionType.APPROVAL_REQUEST,
          config: {
            approverRole: 'instructor',
            notifyVia: ['email', 'push'],
            escalateAfterMinutes: 1440, // 24 hours
          },
          continueOnError: false,
        },
      ],
      isTerminal: false,
      uiMetadata: { x: 500, y: 100 },
    },
    {
      code: 'approved',
      nameKey: 'workflow.state.approved',
      type: 'END',
      onEnterActions: [
        {
          type: ActionType.EMAIL_SEND,
          config: {
            templateCode: 'cv-approved',
            recipientField: 'payload.metadata.studentEmail',
            attachDocuments: true,
          },
          continueOnError: true,
        },
        {
          type: ActionType.DATA_SAVE,
          config: {
            entityType: 'student-document',
            updateFields: {
              approvalStatus: 'APPROVED',
              approvedAt: '{{now}}',
              approvedBy: '{{userId}}',
            },
          },
          continueOnError: false,
        },
      ],
      isTerminal: true,
      uiMetadata: { x: 700, y: 50 },
    },
    {
      code: 'rejected',
      nameKey: 'workflow.state.rejected',
      type: 'END',
      onEnterActions: [
        {
          type: ActionType.EMAIL_SEND,
          config: {
            templateCode: 'cv-rejected',
            recipientField: 'payload.metadata.studentEmail',
            includeRejectionReason: true,
          },
          continueOnError: true,
        },
      ],
      isTerminal: true,
      uiMetadata: { x: 700, y: 150 },
    },
  ],
  
  transitions: [
    {
      code: 'start-to-analysis',
      nameKey: 'workflow.transition.submit',
      fromStateCode: 'start',
      toStateCode: 'ai-analysis',
      isAutomatic: true,
      priority: 1,
    },
    {
      code: 'analysis-to-review',
      nameKey: 'workflow.transition.send-for-review',
      fromStateCode: 'ai-analysis',
      toStateCode: 'pending-review',
      isAutomatic: true,
      priority: 1,
    },
    {
      code: 'review-to-approved',
      nameKey: 'workflow.transition.approve',
      fromStateCode: 'pending-review',
      toStateCode: 'approved',
      requiredRole: 'instructor',
      isAutomatic: false,
      priority: 1,
    },
    {
      code: 'review-to-rejected',
      nameKey: 'workflow.transition.reject',
      fromStateCode: 'pending-review',
      toStateCode: 'rejected',
      requiredRole: 'instructor',
      isAutomatic: false,
      priority: 1,
    },
  ],
  
  initialStateCode: 'start',
  terminalStateCodes: ['approved', 'rejected'],
  
  timeoutMinutes: 2880, // 48 hours
  
  escalationChain: [
    {
      afterMinutes: 1440, // 24 hours
      escalateToUserId: 'supervisor-001',
    },
  ],
  
  isManuallyTriggerable: true,
  
  triggers: [
    {
      eventType: 'student-document.created',
      condition: 'payload.documentCategoryCode === "cv"',
    },
  ],
};
```

### Example 2: Timesheet Approval Workflow

```typescript
const timesheetApprovalWorkflow: WorkflowDefinition = {
  code: 'timesheet-approval',
  name: 'Timesheet Approval',
  description: 'Weekly timesheet validation and approval',
  categoryCode: 'approval',
  version: 1,
  isActiveVersion: true,
  
  states: [
    {
      code: 'submitted',
      nameKey: 'workflow.state.submitted',
      type: 'START',
      onEnterActions: [
        {
          type: ActionType.DATA_VALIDATE,
          config: {
            validations: [
              { field: 'payload.metadata.totalHours', rule: 'lessThanOrEqual', value: 80 },
              { field: 'payload.metadata.totalHours', rule: 'greaterThan', value: 0 },
            ],
          },
          continueOnError: false,
        },
      ],
      isTerminal: false,
    },
    {
      code: 'manager-review',
      nameKey: 'workflow.state.manager-review',
      type: 'APPROVAL',
      onEnterActions: [
        {
          type: ActionType.APPROVAL_REQUEST,
          config: {
            approverField: 'payload.metadata.managerId',
            notifyVia: ['email'],
          },
          continueOnError: false,
        },
      ],
      timeoutMinutes: 2880, // 48 hours
      isTerminal: false,
    },
    {
      code: 'approved',
      nameKey: 'workflow.state.approved',
      type: 'END',
      isTerminal: true,
    },
    {
      code: 'rejected',
      nameKey: 'workflow.state.rejected',
      type: 'END',
      isTerminal: true,
    },
  ],
  
  transitions: [
    {
      code: 'submit-to-review',
      nameKey: 'workflow.transition.submit',
      fromStateCode: 'submitted',
      toStateCode: 'manager-review',
      isAutomatic: true,
      priority: 1,
    },
    {
      code: 'approve',
      nameKey: 'workflow.transition.approve',
      fromStateCode: 'manager-review',
      toStateCode: 'approved',
      isAutomatic: false,
      priority: 1,
    },
    {
      code: 'reject',
      nameKey: 'workflow.transition.reject',
      fromStateCode: 'manager-review',
      toStateCode: 'rejected',
      isAutomatic: false,
      priority: 1,
    },
  ],
  
  initialStateCode: 'submitted',
  terminalStateCodes: ['approved', 'rejected'],
  
  isManuallyTriggerable: true,
  
  // ... other fields
} as WorkflowDefinition;
```

## Database Schema

```sql
-- Workflow definitions
CREATE TABLE workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL,
  language VARCHAR(2) NOT NULL,
  
  category_code VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL,
  is_active_version BOOLEAN DEFAULT false,
  
  states JSONB NOT NULL,
  transitions JSONB NOT NULL,
  initial_state_code VARCHAR(100) NOT NULL,
  terminal_state_codes TEXT[] NOT NULL,
  
  timeout_minutes INTEGER,
  escalation_chain JSONB,
  payload_schema JSONB,
  
  is_manually_triggerable BOOLEAN DEFAULT true,
  triggers JSONB,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, code, version),
  INDEX idx_workflow_defs_tenant (tenant_id),
  INDEX idx_workflow_defs_category (tenant_id, category_code)
);

-- Workflow executions
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  workflow_definition_id UUID NOT NULL REFERENCES workflow_definitions(id),
  workflow_definition_code VARCHAR(255) NOT NULL,
  workflow_definition_version INTEGER NOT NULL,
  
  current_state_code VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  
  payload JSONB NOT NULL,
  context JSONB NOT NULL DEFAULT '{}',
  history JSONB NOT NULL DEFAULT '[]',
  
  started_by_user_id UUID NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_message TEXT,
  
  related_entity_type VARCHAR(100),
  related_entity_id UUID,
  parent_workflow_execution_id UUID,
  
  priority INTEGER DEFAULT 5,
  tags TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  INDEX idx_workflow_execs_tenant (tenant_id),
  INDEX idx_workflow_execs_status (tenant_id, status),
  INDEX idx_workflow_execs_related (tenant_id, related_entity_type, related_entity_id),
  INDEX idx_workflow_execs_started (started_at)
);
```

---

**Document Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Final
