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

// authService.getUserFromAccessToken
vi.mock("@/lib/auth/domain/authService", () => ({
  authService: {
    getUserFromAccessToken: vi.fn(),
  },
}));

// logger
vi.mock("@/lib/core/logger", () => ({
  logAuthEvent: vi.fn(),
}));

// withApiRoute – identity
vi.mock("@/lib/http/withApiRoute", () => ({
  withApiRoute: (handler: any) => handler,
}));

// ----------------------
// Imports (after mocks)
// ----------------------

import { GET } from "./route";
import { authService } from "@/lib/auth/domain/authService";
import { logAuthEvent } from "@/lib/core/logger";
import { HttpError } from "@/lib/core/errors";

const mockGetUserFromAccessToken = (authService as any).getUserFromAccessToken as ReturnType<
  typeof vi.fn
>;
const mockLogAuthEvent = logAuthEvent as unknown as ReturnType<typeof vi.fn>;

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // No access_token cookie -> user: null
  // ---------------------------------------------------------------------------

  it("returns user: null when there is no access_token cookie", async () => {
    const req = new Request("http://localhost/api/auth/me", {
      method: "GET",
      headers: {
        // no cookie header at all
      },
    });

    const res: any = await GET(req);

    expect(mockGetUserFromAccessToken).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: null });
    expect(mockLogAuthEvent).not.toHaveBeenCalled();
  });

  it("returns user: null when cookie header exists but contains no access_token", async () => {
    const req = new Request("http://localhost/api/auth/me", {
      method: "GET",
      headers: {
        cookie: "other_cookie=123; foo=bar",
      },
    });

    const res: any = await GET(req);

    expect(mockGetUserFromAccessToken).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: null });
    expect(mockLogAuthEvent).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Valid access_token -> returns user
  // ---------------------------------------------------------------------------

  it("returns user when access_token cookie is present and valid", async () => {
    const user = {
      id: "user-1",
      email: "user@example.com",
      role: "user" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    mockGetUserFromAccessToken.mockResolvedValueOnce(user);

    const req = new Request("http://localhost/api/auth/me", {
      method: "GET",
      headers: {
        cookie: "other_cookie=123; access_token=abc123; foo=bar",
      },
    });

    const res: any = await GET(req);

    expect(mockGetUserFromAccessToken).toHaveBeenCalledWith("abc123");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user });
    expect(mockLogAuthEvent).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Invalid token -> HttpError 401/404 -> user: null, log, 200
  // ---------------------------------------------------------------------------

  it("returns user: null and logs when token is invalid (HttpError 401)", async () => {
    const error = new HttpError(401, "Invalid token", "TOKEN_INVALID");
    mockGetUserFromAccessToken.mockRejectedValueOnce(error);

    const req = new Request("http://localhost/api/auth/me", {
      method: "GET",
      headers: {
        cookie: "access_token=badtoken",
      },
    });

    const res: any = await GET(req);

    expect(mockGetUserFromAccessToken).toHaveBeenCalledWith("badtoken");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: null });

    expect(mockLogAuthEvent).toHaveBeenCalledWith("me_token_invalid_or_user_missing", {
      statusCode: 401,
      code: "TOKEN_INVALID",
    });
  });

  it("returns user: null and logs when user is missing (HttpError 404)", async () => {
    const error = new HttpError(404, "User not found", "USER_NOT_FOUND");
    mockGetUserFromAccessToken.mockRejectedValueOnce(error);

    const req = new Request("http://localhost/api/auth/me", {
      method: "GET",
      headers: {
        cookie: "access_token=token123",
      },
    });

    const res: any = await GET(req);

    expect(mockGetUserFromAccessToken).toHaveBeenCalledWith("token123");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: null });

    expect(mockLogAuthEvent).toHaveBeenCalledWith("me_token_invalid_or_user_missing", {
      statusCode: 404,
      code: "USER_NOT_FOUND",
    });
  });

  // ---------------------------------------------------------------------------
  // Other error -> rethrown (handled by withApiRoute + global handler)
  // ---------------------------------------------------------------------------

  it("rethrows non-HttpError or other status errors", async () => {
    const genericError = new Error("Unexpected");
    mockGetUserFromAccessToken.mockRejectedValueOnce(genericError);

    const req = new Request("http://localhost/api/auth/me", {
      method: "GET",
      headers: {
        cookie: "access_token=token123",
      },
    });

    await expect(GET(req)).rejects.toBe(genericError);

    const http500 = new HttpError(500, "Server issue", "INTERNAL");
    mockGetUserFromAccessToken.mockRejectedValueOnce(http500);

    const req2 = new Request("http://localhost/api/auth/me", {
      method: "GET",
      headers: {
        cookie: "access_token=token123",
      },
    });

    await expect(GET(req2)).rejects.toBe(http500);
  });
});
