import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { __memoryUserRepoTestUtils } from "@/lib/auth/userRepository.memory";
import { authService } from "@/lib/auth/authService";

// Mock the email service so no real emails/logs happen
vi.mock("@/lib/email/emailService", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

import { sendPasswordResetEmail } from "@/lib/email/emailService";

// Helper to create a fake HTTP request
const createRequest = (body: any) =>
  new Request("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    // Reset in-memory users before every test
    __memoryUserRepoTestUtils.reset();
    vi.clearAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const req = createRequest({});

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Email is required");
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("returns 200 and generic message when email does not exist", async () => {
    const req = createRequest({ email: "unknown@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toContain("If that email exists");
    expect(data.resetToken).toBeUndefined();
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("returns 200, calls sendPasswordResetEmail, and includes resetToken in non-production", async () => {
    const email = "known@example.com";
    const password = "Password1";

    // Create a real user in memory
    await authService.register(email, password);

    const req = createRequest({ email });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Reset link created");
    expect(typeof data.resetToken).toBe("string");

    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);

    const callArgs = vi.mocked(sendPasswordResetEmail).mock.calls[0];

    // Check correct arguments were passed
    expect(callArgs[0]).toBe(email.toLowerCase());
    expect(callArgs[1]).toContain("/reset-password?token=");
  });
});
