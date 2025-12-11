import { describe, it, expect, vi, beforeEach } from "vitest";

// ----------------------
// Mocks (before imports)
// ----------------------

// Mock NextResponse with minimal behavior for json + cookies
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

// authService.register
vi.mock("@/lib/auth/domain/authService", () => ({
  authService: {
    register: vi.fn(),
  },
}));

// validation schemas
vi.mock("@/lib/auth/domain/validation/authSchemas", () => ({
  emailSchema: {
    parse: vi.fn(),
  },
  passwordSchema: {
    parse: vi.fn(),
  },
}));

// logger
vi.mock("@/lib/core/logger", () => ({
  logAuthEvent: vi.fn(),
}));

// env
vi.mock("@/lib/core/env", () => ({
  NODE_ENV: "production", // so secure cookies should be true
}));

// withApiRoute – return handler directly
vi.mock("@/lib/http/withApiRoute", () => ({
  withApiRoute: (handler: any) => handler,
}));

// ----------------------
// Imports (after mocks)
// ----------------------

import { POST } from "./route";
import { authService } from "@/lib/auth/domain/authService";
import { emailSchema, passwordSchema } from "@/lib/auth/domain/validation/authSchemas";
import { logAuthEvent } from "@/lib/core/logger";

const mockRegister = (authService as any).register as ReturnType<typeof vi.fn>;
const mockEmailParse = (emailSchema as any).parse as ReturnType<typeof vi.fn>;
const mockPasswordParse = (passwordSchema as any).parse as ReturnType<typeof vi.fn>;
const mockLogAuthEvent = logAuthEvent as unknown as ReturnType<typeof vi.fn>;

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a user, returns 201, sets cookies and logs event", async () => {
    mockEmailParse.mockReturnValueOnce("user@example.com");
    mockPasswordParse.mockReturnValueOnce("Password1");

    const user = {
      id: "user-1",
      email: "user@example.com",
      role: "user" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    mockRegister.mockResolvedValueOnce({
      user,
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "Password1",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const res: any = await POST(req);

    // validation
    expect(mockEmailParse).toHaveBeenCalledWith("user@example.com");
    expect(mockPasswordParse).toHaveBeenCalledWith("Password1");

    // authService.register
    expect(mockRegister).toHaveBeenCalledWith("user@example.com", "Password1");

    // response status & body
    expect(res.status).toBe(201);
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
    expect(mockLogAuthEvent).toHaveBeenCalledWith("register_success", {
      userId: "user-1",
    });
  });
});
