/**
 * InternalServerError
 * Unexpected server error (500 Internal Server Error)
 */

import { AppError } from "./AppError";

export class InternalServerError extends AppError {
  constructor(
    message: string = "Internal server error",
    details?: Record<string, any>,
  ) {
    super(500, "INTERNAL_SERVER_ERROR", message, details);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
