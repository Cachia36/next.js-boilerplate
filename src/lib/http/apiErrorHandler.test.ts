import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZodError } from "zod";

// ----------------------
// Mocks (must be before imports)
// ----------------------

// Mock next/server (NextResponse.json)
vi.mock("next/server", () => {
  const json = vi.fn((body: any, init?: any) => ({
    body,
    status: init?.status ?? 200,
  }));

  return {
    NextResponse: {
      json,
    },
  };
});

// Mock logger
vi.mock("../core/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

// Mock errors: HttpError + toApiError
vi.mock("../core/errors", () => {
  class MockHttpError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, message: string, code: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  }

  const toApiError = vi.fn();

  return {
    HttpError: MockHttpError,
    toApiError,
  };
});

// ----------------------
// Imports (after mocks)
// ----------------------

import { NextResponse } from "next/server";
import { handleApiError } from "./apiErrorHandler";
import { HttpError, toApiError } from "../core/errors";
import { logError, logWarn } from "../core/logger";

const mockJson = (NextResponse as any).json as ReturnType<typeof vi.fn>;
const mockToApiError = toApiError as unknown as ReturnType<typeof vi.fn>;
const mockLogWarn = logWarn as unknown as ReturnType<typeof vi.fn>;
const mockLogError = logError as unknown as ReturnType<typeof vi.fn>;

describe("handleApiError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // ZodError branch
  // ---------------------------------------------------------------------------

  it("handles ZodError as a validation error", () => {
    const zodError = new ZodError([]);
    const issues = zodError.flatten();

    const response = handleApiError(zodError);

    expect(mockLogWarn).toHaveBeenCalledWith("api.validation_error", {
      issues,
    });

    expect(mockJson).toHaveBeenCalledWith(
      {
        status: 400,
        message: "Validation error",
        code: "VALIDATION_ERROR",
        issues,
      },
      { status: 400 },
    );

    expect(mockToApiError).not.toHaveBeenCalled();
    expect(response).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // HttpError branch
  // ---------------------------------------------------------------------------

  it("handles HttpError using toApiError and logs as warn", () => {
    const httpError = new HttpError(404, "Not found", "NOT_FOUND");

    const apiError = {
      status: 404,
      message: "Not found",
      code: "NOT_FOUND",
    };

    mockToApiError.mockReturnValueOnce(apiError);

    const response = handleApiError(httpError);

    expect(mockLogWarn).toHaveBeenCalledWith("api.http_error", {
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Not found",
    });

    expect(mockToApiError).toHaveBeenCalledTimes(1);
    const [passedError, defaultError] = mockToApiError.mock.calls[0];

    expect(passedError).toBe(httpError);
    expect(defaultError).toMatchObject({
      status: 500,
      message: "Something went wrong. Please try again later.",
      code: "UNEXPECTED_ERROR",
    });

    expect(mockJson).toHaveBeenCalledWith(apiError, { status: 404 });
    expect(response).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Unknown Error branch
  // ---------------------------------------------------------------------------

  it("handles unknown Error as unhandled error and delegates to toApiError", () => {
    const error = new Error("Boom");
    const apiError = {
      status: 500,
      message: "Something went wrong. Please try again later.",
      code: "UNEXPECTED_ERROR",
    };

    mockToApiError.mockReturnValueOnce(apiError);

    const response = handleApiError(error);

    expect(mockLogError).toHaveBeenCalledWith("api.unhandled_error", {
      error: "Boom",
    });

    expect(mockToApiError).toHaveBeenCalledTimes(1);
    const [passedError, defaultError] = mockToApiError.mock.calls[0];

    expect(passedError).toBe(error);
    expect(defaultError).toMatchObject({
      status: 500,
      message: "Something went wrong. Please try again later.",
      code: "UNEXPECTED_ERROR",
    });

    expect(mockJson).toHaveBeenCalledWith(apiError, { status: 500 });
    expect(response).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Non-Error branch
  // ---------------------------------------------------------------------------

  it("handles non-Error unknown values as unhandled error with generic message", () => {
    const apiError = {
      status: 500,
      message: "Something went wrong. Please try again later.",
      code: "UNEXPECTED_ERROR",
    };

    mockToApiError.mockReturnValueOnce(apiError);

    const response = handleApiError("some string error" as any);

    expect(mockLogError).toHaveBeenCalledWith("api.unhandled_error", {
      error: "Unknown error",
    });

    expect(mockToApiError).toHaveBeenCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith(apiError, { status: 500 });
    expect(response).toBeDefined();
  });
});
