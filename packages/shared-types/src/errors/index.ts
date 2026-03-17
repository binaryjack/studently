/**
 * AppError
 * Base application error class
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * ValidationError
 * Validation failure (400 Bad Request)
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    details?: Record<string, any>,
  ) {
    super(400, "VALIDATION_ERROR", message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * NotFoundError
 * Resource not found (404 Not Found)
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    details?: Record<string, any>,
  ) {
    super(404, "NOT_FOUND", message, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * UnauthorizedError
 * Authentication failure (401 Unauthorized)
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string = "Unauthorized",
    details?: Record<string, any>,
  ) {
    super(401, "UNAUTHORIZED", message, details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * ForbiddenError
 * Authorization failure (403 Forbidden)
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = "Forbidden",
    details?: Record<string, any>,
  ) {
    super(403, "FORBIDDEN", message, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * ConflictError
 * Resource conflict (409 Conflict)
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Conflict",
    details?: Record<string, any>,
  ) {
    super(409, "CONFLICT", message, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * InternalServerError
 * Unexpected server error (500 Internal Server Error)
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = "Internal server error",
    details?: Record<string, any>,
  ) {
    super(500, "INTERNAL_SERVER_ERROR", message, details);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
