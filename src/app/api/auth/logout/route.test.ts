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

// logger
vi.mock("@/lib/core/logger", () => ({
  logAuthEvent: vi.fn(),
}));

// env – default to production so we assert secure: true
vi.mock("@/lib/core/env", () => ({
  NODE_ENV: "production",
}));

// withApiRoute – identity
vi.mock("@/lib/http/withApiRoute", () => ({
  withApiRoute: (handler: any) => handler,
}));

// ----------------------
// Imports (after mocks)
// ----------------------

import { POST } from "./route";
import { logAuthEvent } from "@/lib/core/logger";

const mockLogAuthEvent = logAuthEvent as unknown as ReturnType<typeof vi.fn>;

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears access and refresh tokens, logs event, and returns success message", async () => {
    const req = new Request("http://localhost/api/auth/logout", {
      method: "POST",
    });

    const res: any = await POST(req);

    // Response body + status
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Logged out successfully",
    });

    // Cookies cleared
    const accessCookie = res.cookies.get("access_token");
    const refreshCookie = res.cookies.get("refresh_token");

    expect(accessCookie).toBeDefined();
    expect(accessCookie.value).toBe("");
    expect(accessCookie.options).toMatchObject({
      httpOnly: true,
      path: "/",
      maxAge: 0,
      secure: true, // NODE_ENV mocked as "production"
      sameSite: "lax",
    });

    expect(refreshCookie).toBeDefined();
    expect(refreshCookie.value).toBe("");
    expect(refreshCookie.options).toMatchObject({
      httpOnly: true,
      path: "/",
      maxAge: 0,
      secure: true,
      sameSite: "lax",
    });

    // Logging
    expect(mockLogAuthEvent).toHaveBeenCalledWith("logout_success");
  });
});
