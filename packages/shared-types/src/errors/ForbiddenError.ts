/**
 * ForbiddenError
 * Authorization failure (403 Forbidden)
 */

import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(
    message: string = "Forbidden",
    details?: Record<string, any>,
  ) {
    super(403, "FORBIDDEN", message, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
