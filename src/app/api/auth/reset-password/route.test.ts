import { describe, it, expect, vi, beforeEach } from "vitest";

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

// authService.resetPassword
vi.mock("@/lib/auth/domain/authService", () => ({
  authService: {
    resetPassword: vi.fn(),
  },
}));

// repo
vi.mock("@/lib/auth/repositories/currentRepo", () => ({
  repo: {
    findByPasswordResetToken: vi.fn(),
  },
}));

// validation
vi.mock("@/lib/auth/domain/validation/authSchemas", () => ({
  passwordSchema: {
    parse: vi.fn(),
  },
}));

// logger
vi.mock("@/lib/core/logger", () => ({
  logAuthEvent: vi.fn(),
}));

// withApiRoute – return handler directly so POST === handler
vi.mock("@/lib/http/withApiRoute", () => ({
  withApiRoute: (handler: any) => handler,
}));

// ----------------------
// Imports (after mocks)
// ----------------------

import { POST } from "./route";
import { authService } from "@/lib/auth/domain/authService";
import { repo } from "@/lib/auth/repositories/currentRepo";
import { passwordSchema } from "@/lib/auth/domain/validation/authSchemas";
import { logAuthEvent } from "@/lib/core/logger";

const mockResetPassword = (authService as any).resetPassword as ReturnType<typeof vi.fn>;
const mockFindByPasswordResetToken = repo.findByPasswordResetToken as unknown as ReturnType<
  typeof vi.fn
>;
const mockPasswordParse = (passwordSchema as any).parse as ReturnType<typeof vi.fn>;
const mockLogAuthEvent = logAuthEvent as unknown as ReturnType<typeof vi.fn>;

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Happy path
  // ---------------------------------------------------------------------------

  it("resets password when token and password are valid", async () => {
    const token = "reset-token";
    const rawPassword = "NewPassword1";
    const parsedPassword = "NewPassword1"; // same in this case

    mockPasswordParse.mockReturnValueOnce(parsedPassword);

    const user = {
      id: "user-1",
      email: "user@example.com",
      passwordHash: "old-hash",
      role: "user" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
      passwordResetToken: token,
      passwordResetExpiresAt: "2024-01-01T01:00:00.000Z",
    };

    mockFindByPasswordResetToken.mockResolvedValueOnce(user);
    mockResetPassword.mockResolvedValueOnce(undefined);

    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password: rawPassword }),
      headers: {
        "content-type": "application/json",
      },
    });

    const res: any = await POST(req);

    // Validation
    expect(mockPasswordParse).toHaveBeenCalledWith(rawPassword);

    // Repo lookup
    expect(mockFindByPasswordResetToken).toHaveBeenCalledWith(token);

    // Service call
    expect(mockResetPassword).toHaveBeenCalledWith("user-1", parsedPassword);

    // Logging
    expect(mockLogAuthEvent).toHaveBeenCalledWith("password_reset_completed", { userId: "user-1" });

    // Response
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Password updated successfully",
    });
  });

  // ---------------------------------------------------------------------------
  // Missing token
  // ---------------------------------------------------------------------------

  it("throws HttpError 400 when token is missing", async () => {
    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password: "NewPassword1" }),
      headers: {
        "content-type": "application/json",
      },
    });

    await expect(POST(req)).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Token is required",
    });

    expect(mockPasswordParse).not.toHaveBeenCalled();
    expect(mockFindByPasswordResetToken).not.toHaveBeenCalled();
    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(mockLogAuthEvent).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Invalid / expired token
  // ---------------------------------------------------------------------------

  it("throws HttpError 404 when token is invalid or expired", async () => {
    const token = "invalid-token";

    mockPasswordParse.mockReturnValueOnce("NewPassword1");
    mockFindByPasswordResetToken.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password: "NewPassword1" }),
      headers: {
        "content-type": "application/json",
      },
    });

    await expect(POST(req)).rejects.toMatchObject({
      statusCode: 404,
      code: "TOKEN_INVALID",
      message: "Invalid or expired reset token",
    });

    expect(mockPasswordParse).toHaveBeenCalledWith("NewPassword1");
    expect(mockFindByPasswordResetToken).toHaveBeenCalledWith(token);
    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(mockLogAuthEvent).not.toHaveBeenCalled();
  });
});
