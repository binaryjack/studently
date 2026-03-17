# Base Interfaces

## Overview
This document defines the foundational interfaces used across all entities in the Studently platform. These interfaces ensure consistency, support multi-language content, enable efficient pagination, and provide common flags for UI and business logic.

## Core Base Interfaces

### BaseEntity

The foundation for all entities in the system.

```typescript
/**
 * Base entity interface with core identification and audit fields
 */
export interface BaseEntity {
  /**
   * Technical unique identifier (GUID/UUID v4)
   * Used for technical references, API endpoints, foreign keys
   * Immutable once created
   */
  id: string;

  /**
   * Sequence incremental index for Cursor-based Infinite Fetch Pattern
   * Auto-incremented integer for efficient pagination and ordering
   * Used for cursor-based pagination (WHERE sequence > cursor LIMIT n)
   */
  sequence: number;

  /**
   * Business code for human-readable identification
   * Used for translation lookups and business references
   * Format: kebab-case (e.g., 'software-development', 'student-001')
   * Must be unique within entity type and tenant
   */
  code: string;

  /**
   * Display order for manual sorting
   * Used for UI reordering and custom sorting
   * Can be updated by drag-and-drop operations
   */
  order: number;

  /**
   * Creation timestamp (ISO 8601)
   */
  createdAt: string;

  /**
   * Last update timestamp (ISO 8601)
   */
  updatedAt: string;

  /**
   * ID of user who created this entity
   */
  createdBy: string;

  /**
   * ID of user who last updated this entity
   */
  updatedBy: string;

  /**
   * Tenant ID for multi-tenant isolation
   * All queries must filter by this field
   */
  tenantId: string;
}
```

### TranslatableEntity

Extends BaseEntity for entities requiring multi-language support.

```typescript
/**
 * Interface for entities with translatable content
 * Supports database-driven translations based on code + language
 */
export interface TranslatableEntity extends BaseEntity {
  /**
   * Current language code (ISO 639-1)
   * Examples: 'en', 'fr', 'de', 'it'
   * Used with 'code' to fetch translations from database
   */
  language: string;

  /**
   * Translated display name in the current language
   * Retrieved from translations table using (code, language)
   */
  name: string;

  /**
   * Optional translated description in the current language
   * Retrieved from translations table using (code, language)
   */
  description?: string;
}
```

### FlaggedEntity

Provides common boolean flags for UI state and business logic.

```typescript
/**
 * Interface for entities with common UI and business flags
 * Can be combined with BaseEntity or TranslatableEntity
 */
export interface FlaggedEntity {
  /**
   * Selection state for UI operations
   * Used for bulk operations (delete, export, assign, etc.)
   * Managed client-side, not persisted
   */
  isSelected: boolean;

  /**
   * Active/Inactive status for soft deletion and visibility
   * Inactive entities are hidden from normal queries but not deleted
   * Used for archiving without data loss
   */
  isActive: boolean;
}
```

## Translation Database Schema

### Translations Table

```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  entity_type VARCHAR(100) NOT NULL,  -- 'learning-path', 'competency', etc.
  code VARCHAR(255) NOT NULL,         -- Business code from entity
  language VARCHAR(2) NOT NULL,       -- ISO 639-1 language code
  name VARCHAR(500) NOT NULL,         -- Translated name
  description TEXT,                   -- Translated description (optional)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, entity_type, code, language),
  INDEX idx_translation_lookup (tenant_id, entity_type, code, language)
);
```

### Translation Service Pattern

```typescript
/**
 * Service for retrieving translations based on code and language
 */
export const TranslationService = function() {
  /**
   * Get translation for an entity
   * @param tenantId - Current tenant context
   * @param entityType - Type of entity ('learning-path', 'competency', etc.)
   * @param code - Business code
   * @param language - Target language (ISO 639-1)
   * @returns Translation object or null
   */
  const getTranslation = async (
    tenantId: string,
    entityType: string,
    code: string,
    language: string
  ): Promise<{ name: string; description?: string } | null> => {
    // Query translations table
    // Return cached result if available
    // Fall back to default language if translation not found
  };

  /**
   * Bulk fetch translations for multiple entities
   * @param tenantId - Current tenant context
   * @param entityType - Type of entity
   * @param codes - Array of business codes
   * @param language - Target language
   * @returns Map of code -> translation
   */
  const getTranslations = async (
    tenantId: string,
    entityType: string,
    codes: string[],
    language: string
  ): Promise<Map<string, { name: string; description?: string }>> => {
    // Batch query for performance
    // Return map for efficient lookup
  };

  return {
    getTranslation,
    getTranslations,
  };
};
```

## Cursor-based Pagination Pattern

### Infinite Scroll Implementation

```typescript
/**
 * Request parameters for cursor-based pagination
 */
export interface CursorPaginationRequest {
  /**
   * Last sequence number from previous page
   * If null/undefined, fetch first page
   */
  cursor?: number;

  /**
   * Number of items to fetch per page
   * Default: 20, Max: 100
   */
  limit: number;

  /**
   * Optional filters (entity-specific)
   */
  filters?: Record<string, any>;

  /**
   * Optional sort field (defaults to sequence)
   */
  sortBy?: string;

  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Response for cursor-based pagination
 */
export interface CursorPaginationResponse<T extends BaseEntity> {
  /**
   * Array of entities for current page
   */
  items: T[];

  /**
   * Next cursor for fetching subsequent page
   * Null if no more items
   */
  nextCursor: number | null;

  /**
   * Whether there are more items to fetch
   */
  hasMore: boolean;

  /**
   * Total count (optional, expensive to compute)
   */
  total?: number;
}
```

### Repository Implementation Example

```typescript
/**
 * Generic cursor-based find method for any repository
 */
const findWithCursor = async <T extends BaseEntity>(
  request: CursorPaginationRequest
): Promise<CursorPaginationResponse<T>> => {
  const { cursor, limit = 20, filters = {}, sortBy = 'sequence', sortDirection = 'asc' } = request;
  
  // Build query
  let query = db.table<T>('entity_table')
    .where({ tenantId: getTenantId(), ...filters });
  
  // Apply cursor
  if (cursor !== undefined) {
    const operator = sortDirection === 'asc' ? '>' : '<';
    query = query.where(sortBy, operator, cursor);
  }
  
  // Apply limit + 1 to check for more items
  const items = await query
    .orderBy(sortBy, sortDirection)
    .limit(limit + 1);
  
  // Check if there are more items
  const hasMore = items.length > limit;
  const resultItems = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? resultItems[resultItems.length - 1].sequence : null;
  
  return {
    items: resultItems,
    nextCursor,
    hasMore,
  };
};
```

## Combined Entity Examples

### Example 1: Learning Path (Translatable + Flagged)

```typescript
/**
 * Learning path entity combining all base interfaces
 */
export interface LearningPath extends TranslatableEntity, FlaggedEntity {
  // Inherits: id, sequence, code, order, createdAt, updatedAt, createdBy, updatedBy, tenantId
  // Inherits: language, name, description
  // Inherits: isSelected, isActive
  
  /**
   * Category code for grouping
   */
  categoryCode: string;
  
  /**
   * Estimated duration in hours
   */
  durationHours: number;
  
  /**
   * Difficulty level
   */
  level: 'beginner' | 'intermediate' | 'advanced';
}
```

### Example 2: Student (BaseEntity + Flagged)

```typescript
/**
 * Student entity (not translatable - personal data)
 */
export interface Student extends BaseEntity, FlaggedEntity {
  // Inherits: id, sequence, code, order, createdAt, updatedAt, createdBy, updatedBy, tenantId
  // Inherits: isSelected, isActive
  
  /**
   * First name
   */
  firstName: string;
  
  /**
   * Last name
   */
  lastName: string;
  
  /**
   * Email address
   */
  email: string;
  
  /**
   * Phone number
   */
  phone?: string;
  
  /**
   * Date of birth
   */
  dateOfBirth: string;
  
  /**
   * Swiss-specific: ORP number
   */
  orpNumber?: string;
  
  /**
   * Swiss-specific: LACI/RI/AI status
   */
  employmentStatus?: 'LACI' | 'RI' | 'AI' | 'EMPLOYED' | 'OTHER';
}
```

## Validation Rules

### Zod Schemas

```typescript
import { z } from 'zod';

/**
 * Base entity schema for validation
 */
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  sequence: z.number().int().positive(),
  code: z.string().regex(/^[a-z0-9-]+$/, 'Code must be kebab-case'),
  order: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
  tenantId: z.string().uuid(),
});

/**
 * Translatable entity schema
 */
export const TranslatableEntitySchema = BaseEntitySchema.extend({
  language: z.string().regex(/^[a-z]{2}$/, 'Must be ISO 639-1 language code'),
  name: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
});

/**
 * Flagged entity schema
 */
export const FlaggedEntitySchema = z.object({
  isSelected: z.boolean(),
  isActive: z.boolean(),
});
```

## Usage Guidelines

### When to Use Each Interface

1. **BaseEntity Only**: 
   - Transactional data (timesheets, absences)
   - Personal data (students, users)
   - Technical entities (sessions, tokens)

2. **TranslatableEntity**:
   - Reference data (learning paths, competencies, categories)
   - System configurations (task types, project categories)
   - UI elements (menu items, labels)

3. **FlaggedEntity**:
   - Any entity displayed in lists with selection
   - Any entity requiring soft delete/archive
   - Combine with BaseEntity or TranslatableEntity

### Database Index Strategy

```sql
-- All tables must have these indexes
CREATE INDEX idx_entity_tenant ON table_name(tenant_id);
CREATE INDEX idx_entity_sequence ON table_name(tenant_id, sequence);
CREATE INDEX idx_entity_code ON table_name(tenant_id, code);
CREATE INDEX idx_entity_active ON table_name(tenant_id, is_active) WHERE is_active = true;

-- For ordering support
CREATE INDEX idx_entity_order ON table_name(tenant_id, "order");
```

## Migration Strategy

### Adding Base Interfaces to Existing Entities

1. Add `sequence` column with auto-increment trigger
2. Backfill `code` values from existing data
3. Add `order` column defaulting to sequence
4. Add `isActive` column defaulting to true
5. Create translations table entries for existing names
6. Update API responses to include new fields

### Sequence Generation (PostgreSQL)

```sql
-- Trigger to auto-assign sequence on insert
CREATE OR REPLACE FUNCTION assign_sequence()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sequence IS NULL THEN
    SELECT COALESCE(MAX(sequence), 0) + 1 
    INTO NEW.sequence 
    FROM table_name 
    WHERE tenant_id = NEW.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_sequence
BEFORE INSERT ON table_name
FOR EACH ROW
EXECUTE FUNCTION assign_sequence();
```

## Performance Considerations

### Caching Strategy

- **Translations**: Cache in Redis with TTL (1 hour)
- **Reference Data**: Cache full datasets per tenant
- **Cursor Results**: No caching (real-time data)

### Query Optimization

- Always include `tenant_id` in WHERE clause (partition key)
- Use `sequence` for pagination (indexed, auto-increment)
- Avoid `COUNT(*)` for total counts on large tables
- Fetch translations in bulk, not per-entity

---

**Document Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Final
