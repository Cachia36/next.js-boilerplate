import { describe, it, expect } from "vitest";
import { emailSchema, passwordSchema } from "./authSchemas";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    const result = emailSchema.safeParse("test@example.com");
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = emailSchema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Email is required");
    }
  });

  it("rejects invalid email format", () => {
    const result = emailSchema.safeParse("not-an-email");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Please enter a valid email address"
      );
    }
  });
});

describe("passwordSchema", () => {
  it("accepts a valid password", () => {
    const result = passwordSchema.safeParse("Password1");
    expect(result.success).toBe(true);
  });

  it("rejects too short password", () => {
    const result = passwordSchema.safeParse("Pa1");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Password must be at least 8 characters"
      );
    }
  });

  it("rejects password without uppercase", () => {
    const result = passwordSchema.safeParse("password1");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Password must contain at least one capital letter"
      );
    }
  });

  it("rejects password without number", () => {
    const result = passwordSchema.safeParse("Password");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Password must contain at least one number"
      );
    }
  });
});