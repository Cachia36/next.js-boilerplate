import { describe, it, expect, beforeEach, vi } from "vitest";
import crypto from "crypto";

import { memoryUserRepository, __memoryUserRepoTestUtils } from "./userRepository.memory";
import type { DbUser } from "@/types/user";

describe("memoryUserRepository", () => {
  const randomUUIDSpy = vi.spyOn(crypto, "randomUUID");

  beforeEach(() => {
    __memoryUserRepoTestUtils.reset();
    vi.clearAllMocks();
    randomUUIDSpy.mockReturnValue("123e4567-e89b-12d3-a456-426614174000");
  });

  // ---------------------------------------------------------------------------
  // findByEmail
  // ---------------------------------------------------------------------------

  describe("findByEmail", () => {
    it("returns null when user does not exist", async () => {
      const result = await memoryUserRepository.findByEmail("missing@example.com");
      expect(result).toBeNull();
    });

    it("finds user by normalized email (trim + lowercase)", async () => {
      await memoryUserRepository.createUser({
        email: "user@example.com",
        passwordHash: "hash",
        role: "user",
      });

      const result = await memoryUserRepository.findByEmail("  USER@Example.com  ");

      expect(result).not.toBeNull();
      expect(result!.email).toBe("user@example.com");
    });
  });

  // ---------------------------------------------------------------------------
  // findById
  // ---------------------------------------------------------------------------

  describe("findById", () => {
    it("returns null when user with id does not exist", async () => {
      const result = await memoryUserRepository.findById("unknown-id");
      expect(result).toBeNull();
    });

    it("finds user by id", async () => {
      const created = await memoryUserRepository.createUser({
        email: "user@example.com",
        passwordHash: "hash",
        role: "user",
      });

      const result = await memoryUserRepository.findById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
    });
  });

  // ---------------------------------------------------------------------------
  // createUser
  // ---------------------------------------------------------------------------

  describe("createUser", () => {
    it("creates a new user with normalized email and generated id", async () => {
      const user = await memoryUserRepository.createUser({
        email: "  USER@Example.com ",
        passwordHash: "hashed-password",
        role: "user",
      });

      expect(randomUUIDSpy).toHaveBeenCalled();

      expect(user).toMatchObject<Partial<DbUser>>({
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "user@example.com",
        role: "user",
        passwordHash: "hashed-password",
      });

      // createdAt should be a valid ISO string
      expect(typeof user.createdAt).toBe("string");
      expect(new Date(user.createdAt!).toString()).not.toBe("Invalid Date");

      // reset token fields should start as null
      expect(user.passwordResetToken).toBeNull();
      expect(user.passwordResetExpiresAt).toBeNull();
    });

    it("throws HttpError 409 if email already exists (case-insensitive)", async () => {
      await memoryUserRepository.createUser({
        email: "user@example.com",
        passwordHash: "hash",
        role: "user",
      });

      await expect(
        memoryUserRepository.createUser({
          email: "USER@EXAMPLE.COM",
          passwordHash: "hash2",
          role: "user",
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: "AUTH_EMAIL_ALREADY_EXISTS",
      });
    });
  });

  // ---------------------------------------------------------------------------
  // updatePassword
  // ---------------------------------------------------------------------------

  describe("updatePassword", () => {
    it("updates passwordHash for existing user", async () => {
      const user = await memoryUserRepository.createUser({
        email: "user@example.com",
        passwordHash: "old-hash",
        role: "user",
      });

      await memoryUserRepository.updatePassword(user.id, "new-hash");

      const updated = await memoryUserRepository.findById(user.id);
      expect(updated!.passwordHash).toBe("new-hash");
    });

    it("throws HttpError 404 if user does not exist", async () => {
      await expect(memoryUserRepository.updatePassword("missing-id", "hash")).rejects.toMatchObject(
        {
          statusCode: 404,
          code: "USER_NOT_FOUND",
        },
      );
    });
  });

  // ---------------------------------------------------------------------------
  // setPasswordResetToken
  // ---------------------------------------------------------------------------

  describe("setPasswordResetToken", () => {
    it("sets password reset token and expiry for existing user", async () => {
      const user = await memoryUserRepository.createUser({
        email: "user@example.com",
        passwordHash: "hash",
        role: "user",
      });

      const expiresAt = new Date(Date.now() + 60_000); // +1 minute
      await memoryUserRepository.setPasswordResetToken(user.id, "reset-token", expiresAt);

      const updated = await memoryUserRepository.findById(user.id);
      expect(updated!.passwordResetToken).toBe("reset-token");
      expect(updated!.passwordResetExpiresAt).toBe(expiresAt.toISOString());
    });

    it("throws HttpError 404 if user does not exist", async () => {
      const expiresAt = new Date(Date.now() + 60_000);

      await expect(
        memoryUserRepository.setPasswordResetToken("missing-id", "token", expiresAt),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    });
  });

  // ---------------------------------------------------------------------------
  // findByPasswordResetToken
  // ---------------------------------------------------------------------------

  describe("findByPasswordResetToken", () => {
    it("returns user when token matches and is not expired", async () => {
      const user = await memoryUserRepository.createUser({
        email: "user@example.com",
        passwordHash: "hash",
        role: "user",
      });

      const expiresAt = new Date(Date.now() + 60_000); // +1 minute
      await memoryUserRepository.setPasswordResetToken(user.id, "reset-token", expiresAt);

      const found = await memoryUserRepository.findByPasswordResetToken("reset-token");

      expect(found).not.toBeNull();
      expect(found!.id).toBe(user.id);
    });

    it("returns null when token does not match", async () => {
      const user = await memoryUserRepository.createUser({
        email: "user@example.com",
        passwordHash: "hash",
        role: "user",
      });

      const expiresAt = new Date(Date.now() + 60_000);
      await memoryUserRepository.setPasswordResetToken(user.id, "reset-token", expiresAt);

      const found = await memoryUserRepository.findByPasswordResetToken("other-token");

      expect(found).toBeNull();
    });

    it("returns null when token is expired", async () => {
      const user = await memoryUserRepository.createUser({
        email: "user@example.com",
        passwordHash: "hash",
        role: "user",
      });

      const expiresAt = new Date(Date.now() - 60_000); // -1 minute (expired)
      await memoryUserRepository.setPasswordResetToken(user.id, "reset-token", expiresAt);

      const found = await memoryUserRepository.findByPasswordResetToken("reset-token");

      expect(found).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // clearPasswordResetToken
  // ---------------------------------------------------------------------------

  describe("clearPasswordResetToken", () => {
    it("clears password reset token when user exists", async () => {
      const user = await memoryUserRepository.createUser({
        email: "user@example.com",
        passwordHash: "hash",
        role: "user",
      });

      const expiresAt = new Date(Date.now() + 60_000);
      await memoryUserRepository.setPasswordResetToken(user.id, "reset-token", expiresAt);

      await memoryUserRepository.clearPasswordResetToken(user.id);

      const updated = await memoryUserRepository.findById(user.id);
      expect(updated!.passwordResetToken).toBeNull();
      expect(updated!.passwordResetExpiresAt).toBeNull();
    });

    it("does nothing when user does not exist", async () => {
      // should not throw
      await expect(
        memoryUserRepository.clearPasswordResetToken("missing-id"),
      ).resolves.toBeUndefined();
    });
  });
});
