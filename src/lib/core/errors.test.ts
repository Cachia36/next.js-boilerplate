import { describe, it, expect } from "vitest";
import {
  HttpError,
  createApiError,
  toApiError,
  Unauthorized,
  Forbidden,
  NotFound,
  Conflict,
  TooManyRequests,
} from "./errors";

describe("HttpError", () => {
  it("sets statusCode and code correctly", () => {
    const err = new HttpError(400, "Bad request", "BAD_REQUEST");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Bad request");
    expect(err.code).toBe("BAD_REQUEST");
  });

  it("defaults code to HTTP_ERROR when not provided", () => {
    const err = new HttpError(500, "Oops");
    expect(err.code).toBe("HTTP_ERROR");
  });
});

describe("createApiError", () => {
  it("creates an ApiError object", () => {
    const apiError = createApiError(404, "Not found", "NOT_FOUND");
    expect(apiError).toEqual({
      status: 404,
      message: "Not found",
      code: "NOT_FOUND",
    });
  });
});

describe("toApiError", () => {
  const fallback = {
    status: 500,
    message: "Default",
    code: "UNEXPECTED_ERROR",
  };

  it("maps HttpError to ApiError", () => {
    const httpErr = new HttpError(401, "Unauthorized", "UNAUTHORIZED");
    const apiError = toApiError(httpErr, fallback);

    expect(apiError).toEqual({
      status: 401,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  });

  it("returns fallback for non-HttpError", () => {
    const err = new Error("Something went wrong");
    const apiError = toApiError(err, fallback);

    expect(apiError).toEqual(fallback);
  });

  it("returns fallback for non-Error values", () => {
    const apiError = toApiError("oops", fallback);
    expect(apiError).toEqual(fallback);
  });
});

describe("HTTP helper constructors", () => {
  it("Unauthorized", () => {
    const err = Unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized");
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("Forbidden", () => {
    const err = Forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Forbidden");
    expect(err.code).toBe("FORBIDDEN");
  });

  it("NotFound", () => {
    const err = NotFound();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not Found");
    expect(err.code).toBe("NOT_FOUND");
  });

  it("Conflict", () => {
    const err = Conflict();
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe("Conflict");
    expect(err.code).toBe("CONFLICT");
  });

  it("TooManyRequests", () => {
    const err = TooManyRequests();
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe("Too many requests");
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});
