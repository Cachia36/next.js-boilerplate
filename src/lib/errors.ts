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
