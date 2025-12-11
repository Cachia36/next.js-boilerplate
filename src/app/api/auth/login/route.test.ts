import { describe, it, expect, vi, beforeEach } from "vitest";

// ----------------------
// Mocks (before imports)
// ----------------------

// Mock NextResponse with a minimal implementation that supports
// .json(), .status, .headers, and .cookies.set()
vi.mock("next/server", () => {
  class MockNextResponse {
    body: any;
    status: number;
    headers: Headers;
    cookies: {
      set: (name: string, value: string, options: any) => void;
      get: (name: string) => any;
      all: () => any[];
    };

    constructor(body: any, init?: any) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = new Headers(init?.headers);
      const cookiesStore = new Map<string, any>();
      this.cookies = {
        set: (name: string, value: string, options: any) => {
          cookiesStore.set(name, { value, options });
        },
        get: (name: string) => cookiesStore.get(name),
        all: () => Array.from(cookiesStore.entries()),
      };
    }

    static json(body: any, init?: any) {
      return new MockNextResponse(body, init);
    }
  }

  return {
    NextResponse: MockNextResponse,
  };
});

// authService.login
vi.mock("@/lib/auth/authService", () => ({
  authService: {
    login: vi.fn(),
  },
}));

// rate limiter
vi.mock("@/lib/rateLimiter", () => ({
  checkRateLimit: vi.fn(),
}));

// logger
vi.mock("@/lib/logger", () => ({
  logAuthEvent: vi.fn(),
}));

// validation schemas
vi.mock("@/lib/validation/authSchemas", () => ({
  emailSchema: {
    parse: vi.fn(),
  },
  passwordSchema: {
    parse: vi.fn(),
  },
}));

// env
vi.mock("@/lib/env", () => ({
  NODE_ENV: "production", // so we can assert secure: true on cookies
}));

// withApiRoute – return handler directly (so POST === handler)
vi.mock("@/lib/withApiRoute", () => ({
  withApiRoute: (handler: any) => handler,
}));

// ----------------------
// Imports (after mocks)
// ----------------------

import { POST } from "./route";
import { authService } from "@/lib/auth/authService";
import { checkRateLimit } from "@/lib/rateLimiter";
import { logAuthEvent } from "@/lib/logger";
import { emailSchema, passwordSchema } from "@/lib/validation/authSchemas";
import { HttpError } from "@/lib/errors";

const mockLogin = (authService as any).login as ReturnType<typeof vi.fn>;
const mockCheckRateLimit = checkRateLimit as unknown as ReturnType<typeof vi.fn>;
const mockLogAuthEvent = logAuthEvent as unknown as ReturnType<typeof vi.fn>;
const mockEmailParse = (emailSchema as any).parse as ReturnType<typeof vi.fn>;
const mockPasswordParse = (passwordSchema as any).parse as ReturnType<typeof vi.fn>;

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Happy path
  // ---------------------------------------------------------------------------

  it("returns 200, logs in user, sets access & refresh cookies", async () => {
    const ip = "127.0.0.1";

    mockCheckRateLimit.mockReturnValueOnce({ allowed: true });

    mockEmailParse.mockReturnValueOnce("user@example.com");
    mockPasswordParse.mockReturnValueOnce("Password1");

    const user = {
      id: "user-1",
      email: "user@example.com",
      role: "user" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    mockLogin.mockResolvedValueOnce({
      user,
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "Password1",
      }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
    });

    const res: any = await POST(req);

    // rate limit
    expect(mockCheckRateLimit).toHaveBeenCalledWith(`login:${ip}`, {
      max: 10,
      windowMs: 60_000,
    });

    // validation
    expect(mockEmailParse).toHaveBeenCalledWith("user@example.com");
    expect(mockPasswordParse).toHaveBeenCalledWith("Password1");

    // authService.login
    expect(mockLogin).toHaveBeenCalledWith("user@example.com", "Password1");

    // response status & body
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user,
    });

    // cookies
    const accessCookie = res.cookies.get("access_token");
    const refreshCookie = res.cookies.get("refresh_token");

    expect(accessCookie).toBeDefined();
    expect(accessCookie.value).toBe("access-token");
    expect(accessCookie.options).toMatchObject({
      httpOnly: true,
      path: "/",
      maxAge: 15 * 60,
      secure: true, // NODE_ENV mocked as "production"
      sameSite: "lax",
    });

    expect(refreshCookie).toBeDefined();
    expect(refreshCookie.value).toBe("refresh-token");
    expect(refreshCookie.options).toMatchObject({
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      secure: true,
      sameSite: "lax",
    });

    // logAuthEvent
    expect(mockLogAuthEvent).toHaveBeenCalledWith("login_success", {
      userId: "user-1",
      ip,
    });
  });

  // ---------------------------------------------------------------------------
  // Rate limited
  // ---------------------------------------------------------------------------

  it("returns 429 when rate limit exceeded", async () => {
    const ip = "10.0.0.1";

    mockCheckRateLimit.mockReturnValueOnce({
      allowed: false,
      retryAfterSeconds: 42,
    });

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "Password1",
      }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
    });

    // Now POST throws a HttpError/TooManyRequests instead of returning a response
    await expect(POST(req)).rejects.toMatchObject({
      statusCode: 429,
      code: "RATE_LIMIT_EXCEEDED",
      // don't assert exact text – just ensure it's a string
      message: expect.any(String),
    });

    expect(mockCheckRateLimit).toHaveBeenCalledWith(`login:${ip}`, {
      max: 10,
      windowMs: 60_000,
    });

    // Should NOT call validation or authService when rate-limited
    expect(mockEmailParse).not.toHaveBeenCalled();
    expect(mockPasswordParse).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();

    // logAuthEvent for rate limiting
    expect(mockLogAuthEvent).toHaveBeenCalledWith("login_rate_limited", {
      ip,
      retryAfterSeconds: 42,
    });
  });

  // ---------------------------------------------------------------------------
  // IP fallback behavior
  // ---------------------------------------------------------------------------

  it("falls back to x-real-ip and then 'unknown' for IP", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 10 });

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "Password1",
      }),
      headers: {
        "content-type": "application/json",
        "x-real-ip": "2.2.2.2",
      },
    });

    // Ignore the error; we only care about what IP key was used
    try {
      await POST(req);
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
    }

    expect(mockCheckRateLimit).toHaveBeenCalledWith("login:2.2.2.2", {
      max: 10,
      windowMs: 60_000,
    });

    vi.clearAllMocks();
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 10 });

    const reqUnknown = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "Password1",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    try {
      await POST(reqUnknown);
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
    }

    expect(mockCheckRateLimit).toHaveBeenCalledWith("login:unknown", {
      max: 10,
      windowMs: 60_000,
    });
  });
});
