import { describe, it, expect } from "vitest";
import { emailSchema, passwordSchema } from "./authSchemas";

// ---------------------------------------------------------------------------
// emailSchema
// ---------------------------------------------------------------------------

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    const result = emailSchema.safeParse("user@example.com");
    expect(result.success).toBe(true);
  });

  it("rejects an empty string", () => {
    const result = emailSchema.safeParse("");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email is required");
    }
  });

  it("rejects an invalid email format", () => {
    const result = emailSchema.safeParse("not-an-email");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please enter a valid email address");
    }
  });
});

// ---------------------------------------------------------------------------
// passwordSchema
// ---------------------------------------------------------------------------

describe("passwordSchema", () => {
  it("accepts a valid password", () => {
    const result = passwordSchema.safeParse("Password1");
    expect(result.success).toBe(true);
  });

  it("rejects passwords shorter than 8 characters", () => {
    const result = passwordSchema.safeParse("P1a");

    expect(result.success).toBe(false);
    if (!result.success) {
      // could be multiple issues, but the first one should be min length
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Password must be at least 8 characters");
    }
  });

  it("rejects passwords without a capital letter", () => {
    const result = passwordSchema.safeParse("password1");

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Password must contain at least one capital letter");
    }
  });

  it("rejects passwords without a number", () => {
    const result = passwordSchema.safeParse("Password");

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Password must contain at least one number");
    }
  });
});
