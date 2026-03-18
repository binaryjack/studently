/**
 * NotFoundError
 * Resource not found (404 Not Found)
 */

import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    details?: Record<string, any>,
  ) {
    super(404, "NOT_FOUND", message, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
