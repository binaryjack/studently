/**
 * ValidationError
 * Validation failure (400 Bad Request)
 */

import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    details?: Record<string, any>,
  ) {
    super(400, "VALIDATION_ERROR", message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
