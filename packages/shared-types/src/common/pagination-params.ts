/**
 * PaginationParams
 * Request parameters for paginated API endpoints
 */

import { SortOrder } from "./types";

export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number;

  /** Items per page (max 100) */
  limit: number;

  /** Sort field name */
  sortBy?: string;

  /** Sort direction */
  sortOrder?: SortOrder;

  /** Search query string */
  search?: string;

  /** Additional filters as key-value pairs */
  filters?: Record<string, any>;
}
