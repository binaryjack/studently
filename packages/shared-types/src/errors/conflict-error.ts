/**
 * ConflictError
 * Resource conflict (409 Conflict)
 */

import { AppError } from "./AppError";

export class ConflictError extends AppError {
  constructor(
    message: string = "Conflict",
    details?: Record<string, any>,
  ) {
    super(409, "CONFLICT", message, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
