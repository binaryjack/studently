/**
 * UnauthorizedError
 * Authentication failure (401 Unauthorized)
 */

import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(
    message: string = "Unauthorized",
    details?: Record<string, any>,
  ) {
    super(401, "UNAUTHORIZED", message, details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
