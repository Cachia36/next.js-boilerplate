import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpError } from "@/lib/core/errors";

// ----------------------
// Mocks (before imports)
// ----------------------

// Mock NextResponse
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

// crypto.randomBytes
vi.mock("crypto", () => {
  const randomBytes = vi.fn(() => ({
    toString: vi.fn(() => "fixed-token"),
  }));
  return {
    default: {
      randomBytes,
    },
  };
});

// repo
vi.mock("@/lib/auth/repositories/currentRepo", () => ({
  repo: {
    findByEmail: vi.fn(),
    setPasswordResetToken: vi.fn(),
  },
}));

// email service
vi.mock("@/lib/email/emailService", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

// env
vi.mock("@/lib/core/env", () => ({
  APP_URL: "http://app.test",
  NODE_ENV: "development",
}));

// rate limiter
vi.mock("@/lib/http/rateLimiter", () => ({
  checkRateLimit: vi.fn(),
}));

// logger
vi.mock("@/lib/core/logger", () => ({
  logAuthEvent: vi.fn(),
}));

// validation
vi.mock("@/lib/auth/domain/validation/authSchemas", () => ({
  emailSchema: {
    parse: vi.fn(),
  },
}));

// withApiRoute – return handler directly
vi.mock("@/lib/http/withApiRoute", () => ({
  withApiRoute: (handler: any) => handler,
}));

// ----------------------
// Imports (after mocks)
// ----------------------

import { POST } from "./route";
import crypto from "crypto";
import { repo } from "@/lib/auth/repositories/currentRepo";
import { sendPasswordResetEmail } from "@/lib/email/emailService";
import { checkRateLimit } from "@/lib/http/rateLimiter";
import { logAuthEvent } from "@/lib/core/logger";
import { emailSchema } from "@/lib/auth/domain/validation/authSchemas";

const mockRandomBytes = crypto.randomBytes as unknown as ReturnType<typeof vi.fn>;
const mockFindByEmail = repo.findByEmail as unknown as ReturnType<typeof vi.fn>;
const mockSetPasswordResetToken = repo.setPasswordResetToken as unknown as ReturnType<typeof vi.fn>;
const mockSendPasswordResetEmail = sendPasswordResetEmail as unknown as ReturnType<typeof vi.fn>;
const mockCheckRateLimit = checkRateLimit as unknown as ReturnType<typeof vi.fn>;
const mockLogAuthEvent = logAuthEvent as unknown as ReturnType<typeof vi.fn>;
const mockEmailParse = (emailSchema as any).parse as ReturnType<typeof vi.fn>;

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(0); // so we can reason about expiresAt
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // Rate limited
  // ---------------------------------------------------------------------------

  it("returns 429 and logs event when rate limit exceeded", async () => {
    const ip = "1.2.3.4";

    mockCheckRateLimit.mockReturnValueOnce({
      allowed: false,
      retryAfterSeconds: 120,
    });

    const req = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com" }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
    });

    // Now: POST throws HttpError/TooManyRequests instead of returning a response
    await expect(POST(req)).rejects.toMatchObject({
      statusCode: 429,
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many reset attempts. Please try again later.",
    });

    expect(mockCheckRateLimit).toHaveBeenCalledWith(`forgot-password:${ip}`, {
      max: 5,
      windowMs: 15 * 60_000,
    });

    // No repo or email usage
    expect(mockFindByEmail).not.toHaveBeenCalled();
    expect(mockSetPasswordResetToken).not.toHaveBeenCalled();
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();

    expect(mockLogAuthEvent).toHaveBeenCalledWith("forgot_password_rate_limited", {
      ip,
      retryAfterSeconds: 120,
    });
  });

  // ---------------------------------------------------------------------------
  // Nonexistent email (no user)
  // ---------------------------------------------------------------------------

  it("responds 200 and logs event even if user does not exist", async () => {
    const ip = "5.6.7.8";

    mockCheckRateLimit.mockReturnValueOnce({ allowed: true });
    mockEmailParse.mockReturnValueOnce("  USER@Example.com ");
    mockFindByEmail.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "  USER@Example.com " }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
    });

    const res: any = await POST(req);

    // validation
    expect(mockEmailParse).toHaveBeenCalledWith("  USER@Example.com ");

    // normalization
    expect(mockFindByEmail).toHaveBeenCalledWith("user@example.com");

    // response
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "If that email exists, a reset link has been sent.",
    });

    // should NOT set token or send email
    expect(mockSetPasswordResetToken).not.toHaveBeenCalled();
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();

    expect(mockLogAuthEvent).toHaveBeenCalledWith("forgot_password_nonexistent_email", {
      email: "user@example.com",
      ip,
    });
  });

  // ---------------------------------------------------------------------------
  // Existing user -> token generated + email sent
  // ---------------------------------------------------------------------------

  it("generates reset token, saves it, sends email and returns message + token in non-production", async () => {
    const ip = "9.9.9.9";

    mockCheckRateLimit.mockReturnValueOnce({ allowed: true });
    mockEmailParse.mockReturnValueOnce("user@example.com");

    const user = {
      id: "user-1",
      email: "user@example.com",
      passwordHash: "hash",
      role: "user" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    };

    mockFindByEmail.mockResolvedValueOnce(user);

    const req = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com" }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
    });

    const res: any = await POST(req);

    // rate limit
    expect(mockCheckRateLimit).toHaveBeenCalledWith(`forgot-password:${ip}`, {
      max: 5,
      windowMs: 15 * 60_000,
    });

    // validation
    expect(mockEmailParse).toHaveBeenCalledWith("user@example.com");

    // repo lookup
    expect(mockFindByEmail).toHaveBeenCalledWith("user@example.com");

    // token generation
    expect(mockRandomBytes).toHaveBeenCalledWith(32);

    // expiresAt ~ 30 minutes from now (0 + 30*60_000)
    expect(mockSetPasswordResetToken).toHaveBeenCalledTimes(1);
    const [userIdArg, tokenArg, expiresAtArg] = mockSetPasswordResetToken.mock.calls[0];

    expect(userIdArg).toBe("user-1");
    expect(tokenArg).toBe("fixed-token");
    expect(expiresAtArg).toBeInstanceOf(Date);
    expect(expiresAtArg.getTime()).toBe(30 * 60_000);

    // email sent
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      "user@example.com",
      "http://app.test/reset-password?token=fixed-token",
    );

    // log
    expect(mockLogAuthEvent).toHaveBeenCalledWith("forgot_password_requested", {
      userId: "user-1",
      ip,
    });

    // response (NODE_ENV mocked as "development" => includes resetToken)
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "If that email exists, a reset link has been sent.",
      resetToken: "fixed-token",
    });
  });

  // ---------------------------------------------------------------------------
  // IP fallback behavior
  // ---------------------------------------------------------------------------

  it("uses x-real-ip and then 'unknown' if no forwarded headers", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 10 });

    const reqReal = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
      headers: {
        "content-type": "application/json",
        "x-real-ip": "3.3.3.3",
      },
    });

    // We only care that checkRateLimit is called with the right key; ignore the thrown error
    try {
      await POST(reqReal);
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError); // optional
    }

    expect(mockCheckRateLimit).toHaveBeenCalledWith("forgot-password:3.3.3.3", {
      max: 5,
      windowMs: 15 * 60_000,
    });

    vi.clearAllMocks();
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 10 });

    const reqUnknown = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
      headers: {
        "content-type": "application/json",
      },
    });

    try {
      await POST(reqUnknown);
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError); // optional
    }

    expect(mockCheckRateLimit).toHaveBeenCalledWith("forgot-password:unknown", {
      max: 5,
      windowMs: 15 * 60_000,
    });
  });
});
