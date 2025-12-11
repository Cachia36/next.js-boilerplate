import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, validateConfirmPassword } from "./auth";

describe("validateEmail", () => {
  it("returns undefined for a valid email", () => {
    expect(validateEmail("test@example.com")).toBeUndefined();
    expect(validateEmail("  spaced@example.com  ")).toBeUndefined();
  });

  it("returns 'Email is required' for empty input", () => {
    expect(validateEmail("")).toBe("Email is required");
    expect(validateEmail("   ")).toBe("Email is required");
  });

  it("returns 'Please enter a valid email address' for invalid email", () => {
    expect(validateEmail("not-an-email")).toBe("Please enter a valid email address");
    expect(validateEmail("foo@bar")).toBe("Please enter a valid email address");
  });
});

describe("validatePassword", () => {
  it("returns undefined for a valid password", () => {
    expect(validatePassword("Password1")).toBeUndefined();
    expect(validatePassword("  StrongPass9  ")).toBeUndefined();
  });

  it("validates minimum length", () => {
    expect(validatePassword("")).toBe("Password must be at least 8 characters");
    expect(validatePassword("Short1")).toBe("Password must be at least 8 characters");
  });

  it("requires at least one capital letter", () => {
    expect(validatePassword("lowercase1")).toBe(
      "Password must contain at least one capital letter",
    );
  });

  it("requires at least one number", () => {
    expect(validatePassword("NoNumbers")).toBe("Password must contain at least one number");
  });
});

describe("validateConfirmPassword", () => {
  it("returns error when confirm password is empty", () => {
    expect(validateConfirmPassword("", "Password1")).toBe("Please confirm your password");
    expect(validateConfirmPassword("   ", "Password1")).toBe("Please confirm your password");
  });

  it("returns error when passwords do not match", () => {
    expect(validateConfirmPassword("Password1", "Different1")).toBe("Passwords do not match");
  });

  it("returns undefined when passwords match", () => {
    expect(validateConfirmPassword("Password1", "Password1")).toBeUndefined();
    expect(validateConfirmPassword("  Password1 ", "Password1")).toBeUndefined();
  });
});
