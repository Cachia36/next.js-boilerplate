export class HttpError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string, code = "HTTP_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export type ApiError = {
  message: string;
  code: string;
  status: number;
};

// Helper to create an ApiError object
export function createApiError(status: number, message: string, code: string): ApiError {
  return { status, message, code };
}

// Map any error into an ApiError shape
export function toApiError(
  error: unknown,
  fallback: { status: number; message: string; code: string },
): ApiError {
  if (error instanceof HttpError) {
    return createApiError(error.statusCode, error.message, error.code);
  }

  return createApiError(fallback.status, fallback.message, fallback.code);
}

export const BadRequest = (message: string, code = "BAD_REQUEST") =>
  new HttpError(400, message, code);

export const Unauthorized = (message = "Unauthorized", code = "UNAUTHORIZED") =>
  new HttpError(401, message, code);

export const Forbidden = (message = "Forbidden", code = "FORBIDDEN") =>
  new HttpError(403, message, code);

export const NotFound = (message = "Not Found", code = "NOT_FOUND") =>
  new HttpError(404, message, code);

export const Conflict = (message = "Conflict", code = "CONFLICT") =>
  new HttpError(409, message, code);

export const TooManyRequests = (message = "Too many requests", code = "RATE_LIMIT_EXCEEDED") =>
  new HttpError(429, message, code);
