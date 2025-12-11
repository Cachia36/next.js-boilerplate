import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError, toApiError } from "./errors";
import { logError, logWarn } from "./logger";

const DEFAULT_ERROR = {
  status: 500,
  message: "Something went wrong. Please try again later.",
  code: "UNEXPECTED_ERROR",
};

export function handleApiError(error: unknown) {
  // Zod validation → warn level
  if (error instanceof ZodError) {
    logWarn("api.validation_error", {
      issues: error.flatten(),
    });

    return NextResponse.json(
      {
        status: 400,
        message: "Validation error",
        code: "VALIDATION_ERROR",
        issues: error.flatten(),
      },
      { status: 400 },
    );
  }

  // Known HTTP / business errors → warn level
  if (error instanceof HttpError) {
    logWarn("api.http_error", {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
    });

    const apiError = toApiError(error, DEFAULT_ERROR);

    return NextResponse.json(apiError, {
      status: apiError.status,
    });
  }

  // Truly unexpected errors → error level
  logError("api.unhandled_error", {
    error: error instanceof Error ? error.message : "Unknown error",
  });

  const apiError = toApiError(error, DEFAULT_ERROR);

  return NextResponse.json(apiError, {
    status: apiError.status,
  });
}
