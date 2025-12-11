import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AuthResult } from "../domain/authService";
import {
  getCurrentUser,
  loginRequest,
  registerRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
} from "./authClient";

const globalAny = globalThis as any;

describe("authClient", () => {
  beforeEach(() => {
    globalAny.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("handleResponse via getCurrentUser: returns parsed body on success", async () => {
    const body = { user: { id: "1", email: "test@example.com" } };
    (globalAny.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(body),
    } as unknown as Response);

    const result = await getCurrentUser();

    expect(result).toEqual(body);
  });

  it("handleResponse via getCurrentUser: maps error with JSON payload", async () => {
    (globalAny.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({
        status: 401,
        message: "Unauthorized",
        code: "UNAUTHORIZED",
      }),
    } as unknown as Response);

    await expect(getCurrentUser()).rejects.toMatchObject({
      message: "Unauthorized",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("handleResponse via getCurrentUser: uses fallback message when JSON fails", async () => {
    (globalAny.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
    } as unknown as Response);

    await expect(getCurrentUser()).rejects.toMatchObject({
      message: "Failed to fetch current user",
      statusCode: 500,
    });
  });

  it("loginRequest trims email and password before sending", async () => {
    const fakeResult: AuthResult = {
      user: { id: "1", email: "test@example.com" } as any,
      accessToken: "token",
      refreshToken: "refresh",
    };

    (globalAny.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(fakeResult),
    } as unknown as Response);

    await loginRequest("  test@example.com  ", "  Password1  ");

    expect(globalAny.fetch).toHaveBeenCalledTimes(1);
    const [, options] = (globalAny.fetch as any).mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toEqual({
      email: "test@example.com",
      password: "Password1",
    });
  });

  it("registerRequest trims email and password before sending", async () => {
    const fakeResult: AuthResult = {
      user: { id: "1", email: "test@example.com" } as any,
      accessToken: "token",
      refreshToken: "refresh",
    };

    (globalAny.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(fakeResult),
    } as unknown as Response);

    await registerRequest("  user@example.com  ", "  Password1  ");

    const [, options] = (globalAny.fetch as any).mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toEqual({
      email: "user@example.com",
      password: "Password1",
    });
  });

  it("forgotPasswordRequest trims email", async () => {
    (globalAny.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Response);

    await forgotPasswordRequest("  test@example.com  ");

    const [, options] = (globalAny.fetch as any).mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toEqual({ email: "test@example.com" });
  });

  it("resetPasswordRequest trims password", async () => {
    (globalAny.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ message: "ok" }),
    } as unknown as Response);

    await resetPasswordRequest("token123", "  Password1  ");

    const [, options] = (globalAny.fetch as any).mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toEqual({ token: "token123", password: "Password1" });
  });
});
