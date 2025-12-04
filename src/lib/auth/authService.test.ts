import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "./authService";
import { __memoryUserRepoTestUtils } from "./userRepository.memory";
import { HttpError } from "../errors";

describe("authService", () => {
  beforeEach(() => {
    // clear in-memory users before every test
    __memoryUserRepoTestUtils.reset();
  });

  it("registers a new user and returns token + user", async () => {
    const email = "test@example.com";
    const password = "Password1"; // matches frontend rules

    const result = await authService.register(email, password);

    expect(result.user.email).toBe(email.toLowerCase());
    expect(result.user.id).toBeTruthy();
    expect(result.user.role).toBe("user");
    expect(result.token).toBeTypeOf("string");
  });

  it("does not allow duplicate emails", async () => {
    const email = "duplicate@example.com";
    const password = "Password1";

    await authService.register(email, password);

    await expect(authService.register(email, password)).rejects.toMatchObject({
      message: "Email already in use",
    });
  });

  it("allows login with correct credentials", async () => {
    const email = "login@example.com";
    const password = "Password1";

    const reg = await authService.register(email, password);

    const login = await authService.login(email, password);

    expect(login.user.id).toBe(reg.user.id);
    expect(login.token).toBeTypeOf("string");
  });

  it("rejects login with wrong password", async () => {
    const email = "wrongpass@example.com";
    const password = "Password1";

    await authService.register(email, password);

    await expect(authService.login(email, "Password2")).rejects.toMatchObject({
      message: "Invalid credentials",
    });
  });

  it("changes password so old one stops working and new one works", async () => {
    const email = "reset@example.com";
    const oldPassword = "Password1";
    const newPassword = "Newpass1";

    // Register + login with old password
    const reg = await authService.register(email, oldPassword);
    const loginBefore = await authService.login(email, oldPassword);
    expect(loginBefore.user.id).toBe(reg.user.id);

    // Reset password
    await authService.resetPassword(reg.user.id, newPassword);

    // Old password should no longer work
    await expect(authService.login(email, oldPassword)).rejects.toMatchObject({
      message: "Invalid credentials",
    });

    // New password should work
    const loginAfter = await authService.login(email, newPassword);
    expect(loginAfter.user.id).toBe(reg.user.id);
  });

  it("throws when resetting password for non-existent user", async () => {
    const fakeUserId = "non-existent-id";
    const newPassword = "Password1";

    await expect(
      authService.resetPassword(fakeUserId, newPassword)
    ).rejects.toBeInstanceOf(HttpError);
  });
});