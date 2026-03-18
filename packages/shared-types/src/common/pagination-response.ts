/**
 * PaginationResponse
 * Response wrapper for paginated data
 */

export interface PaginationResponse<T> {
  /** Array of items for current page */
  data: T[];

  /** Total number of items (across all pages) */
  total: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there is a next page */
  hasNextPage: boolean;

  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}
