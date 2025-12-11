import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../repositories/currentRepo", () => ({
  repo: {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
    updatePassword: vi.fn(),
    clearPasswordResetToken: vi.fn(),
  },
}));

vi.mock("./passwordService", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("./jwtService", () => ({
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
}));

vi.mock("../../core/logger", () => ({
  logAuthEvent: vi.fn(),
}));

import { authService } from "./authService";
import { HttpError } from "../../core/errors";
import { repo } from "../repositories/currentRepo";
import { hashPassword, verifyPassword } from "./passwordService";
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "./jwtService";
import { logAuthEvent } from "../../core/logger";

const mockRepo = repo as unknown as {
  findByEmail: ReturnType<typeof vi.fn>;
  createUser: ReturnType<typeof vi.fn>;
  updatePassword: ReturnType<typeof vi.fn>;
  clearPasswordResetToken: ReturnType<typeof vi.fn>;
};

const mockHashPassword = hashPassword as unknown as ReturnType<typeof vi.fn>;
const mockVerifyPassword = verifyPassword as unknown as ReturnType<typeof vi.fn>;
const mockGenerateAccessToken = generateAccessToken as unknown as ReturnType<typeof vi.fn>;
const mockGenerateRefreshToken = generateRefreshToken as unknown as ReturnType<typeof vi.fn>;
const mockVerifyAccessToken = verifyAccessToken as unknown as ReturnType<typeof vi.fn>;
const mockLogAuthEvent = logAuthEvent as unknown as ReturnType<typeof vi.fn>;

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // register
  // ---------------------------------------------------------------------------

  describe("register", () => {
    it("registers a new user successfully", async () => {
      const email = "Test@Email.com";
      const password = "password123";

      mockRepo.findByEmail.mockResolvedValueOnce(null);
      mockHashPassword.mockResolvedValueOnce("hashed-password");
      const createdUser = {
        id: "user-1",
        email: "test@email.com",
        passwordHash: "hashed-password",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      };
      mockRepo.createUser.mockResolvedValueOnce(createdUser);

      mockGenerateAccessToken.mockReturnValueOnce("access-token");
      mockGenerateRefreshToken.mockReturnValueOnce("refresh-token");

      const result = await authService.register(email, password);

      expect(mockRepo.findByEmail).toHaveBeenCalledWith("test@email.com");
      expect(mockHashPassword).toHaveBeenCalledWith(password);
      expect(mockRepo.createUser).toHaveBeenCalledWith({
        email: "test@email.com",
        passwordHash: "hashed-password",
        role: "user",
      });

      // tokens
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");

      // user should not contain sensitive fields
      expect(result.user).toEqual({
        id: "user-1",
        email: "test@email.com",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).not.toHaveProperty("passwordResetToken");
      expect(result.user).not.toHaveProperty("passwordResetExpiresAt");

      expect(mockLogAuthEvent).toHaveBeenCalledWith("register_success", {
        userId: "user-1",
        email: "test@email.com",
      });
    });

    it("normalizes email by trimming and lowercasing", async () => {
      mockRepo.findByEmail.mockResolvedValueOnce(null);
      mockHashPassword.mockResolvedValueOnce("hashed");
      mockRepo.createUser.mockResolvedValueOnce({
        id: "user-1",
        email: "normalized@email.com",
        passwordHash: "hashed",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      });
      mockGenerateAccessToken.mockReturnValueOnce("access-token");
      mockGenerateRefreshToken.mockReturnValueOnce("refresh-token");

      await authService.register("  NORMALIZED@Email.Com  ", "pass");

      expect(mockRepo.findByEmail).toHaveBeenCalledWith("normalized@email.com");
      expect(mockRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "normalized@email.com",
        }),
      );
    });

    it("throws HttpError 409 if email already exists", async () => {
      mockRepo.findByEmail.mockResolvedValueOnce({
        id: "user-1",
        email: "test@email.com",
        passwordHash: "hash",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      });

      await expect(authService.register("test@email.com", "pass")).rejects.toMatchObject({
        statusCode: 409,
        code: "AUTH_EMAIL_ALREADY_EXISTS",
      });

      expect(mockRepo.createUser).not.toHaveBeenCalled();
      expect(mockHashPassword).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------

  describe("login", () => {
    it("logs in a user successfully", async () => {
      const email = "User@Email.com";
      const password = "password123";

      const foundUser = {
        id: "user-1",
        email: "user@email.com",
        passwordHash: "hashed-password",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      };

      mockRepo.findByEmail.mockResolvedValueOnce(foundUser);
      mockVerifyPassword.mockResolvedValueOnce(true);
      mockGenerateAccessToken.mockReturnValueOnce("access-token");
      mockGenerateRefreshToken.mockReturnValueOnce("refresh-token");

      const result = await authService.login(email, password);

      expect(mockRepo.findByEmail).toHaveBeenCalledWith("user@email.com");
      expect(mockVerifyPassword).toHaveBeenCalledWith(password, "hashed-password");

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");

      // user should not contain sensitive fields
      expect(result.user).toEqual({
        id: "user-1",
        email: "user@email.com",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
      });

      expect(mockLogAuthEvent).toHaveBeenCalledWith("login_success", {
        userId: "user-1",
      });
    });

    it("normalizes email by trimming and lowercasing", async () => {
      mockRepo.findByEmail.mockResolvedValueOnce({
        id: "user-1",
        email: "normalized@email.com",
        passwordHash: "hash",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      });
      mockVerifyPassword.mockResolvedValueOnce(true);
      mockGenerateAccessToken.mockReturnValueOnce("access-token");
      mockGenerateRefreshToken.mockReturnValueOnce("refresh-token");

      await authService.login("  NORMALIZED@Email.Com  ", "pass");

      expect(mockRepo.findByEmail).toHaveBeenCalledWith("normalized@email.com");
    });

    it("throws HttpError 401 if user is not found", async () => {
      mockRepo.findByEmail.mockResolvedValueOnce(null);

      await expect(authService.login("missing@email.com", "pass")).rejects.toMatchObject({
        statusCode: 401,
        code: "AUTH_INVALID_CREDENTIALS",
      });

      expect(mockVerifyPassword).not.toHaveBeenCalled();
      expect(mockLogAuthEvent).toHaveBeenCalledWith("login_failed_no_user", {
        email: "missing@email.com",
      });
    });

    it("throws HttpError 401 if password is invalid", async () => {
      mockRepo.findByEmail.mockResolvedValueOnce({
        id: "user-1",
        email: "user@email.com",
        passwordHash: "hashed",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      });
      mockVerifyPassword.mockResolvedValueOnce(false);

      await expect(authService.login("user@email.com", "bad-pass")).rejects.toMatchObject({
        statusCode: 401,
        code: "AUTH_INVALID_CREDENTIALS",
      });

      expect(mockLogAuthEvent).toHaveBeenCalledWith("login_failed_bad_password", {
        userId: "user-1",
      });
    });
  });

  // ---------------------------------------------------------------------------
  // getUserFromAccessToken
  // ---------------------------------------------------------------------------

  describe("getUserFromAccessToken", () => {
    it("returns user built from token payload", async () => {
      mockVerifyAccessToken.mockReturnValueOnce({
        sub: "user-1",
        email: "user@email.com",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
      });

      const user = await authService.getUserFromAccessToken("some-token");

      expect(mockVerifyAccessToken).toHaveBeenCalledWith("some-token");
      expect(user).toEqual({
        id: "user-1",
        email: "user@email.com",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
      });
    });

    it("propagates error when token is invalid", async () => {
      const error = new Error("Invalid token");
      mockVerifyAccessToken.mockImplementationOnce(() => {
        throw error;
      });

      await expect(authService.getUserFromAccessToken("bad-token")).rejects.toBe(error);
    });
  });

  // ---------------------------------------------------------------------------
  // resetPassword
  // ---------------------------------------------------------------------------

  describe("resetPassword", () => {
    it("successfully resets password", async () => {
      mockHashPassword.mockResolvedValueOnce("new-hash");
      mockRepo.updatePassword.mockResolvedValueOnce(undefined);
      mockRepo.clearPasswordResetToken.mockResolvedValueOnce(undefined);

      await authService.resetPassword("user-1", "new-password");

      expect(mockHashPassword).toHaveBeenCalledWith("new-password");
      expect(mockRepo.updatePassword).toHaveBeenCalledWith("user-1", "new-hash");
      expect(mockRepo.clearPasswordResetToken).toHaveBeenCalledWith("user-1");
      expect(mockLogAuthEvent).toHaveBeenCalledWith("password_reset_success", {
        userId: "user-1",
      });
    });

    it("rethrows HttpError from repo.updatePassword", async () => {
      const httpError = new HttpError(404, "User not found", "USER_NOT_FOUND");
      mockHashPassword.mockResolvedValueOnce("new-hash");
      mockRepo.updatePassword.mockRejectedValueOnce(httpError);

      await expect(authService.resetPassword("user-1", "new-password")).rejects.toBe(httpError);

      expect(mockRepo.clearPasswordResetToken).not.toHaveBeenCalled();
    });

    it("wraps unknown error from repo.updatePassword in HttpError 500", async () => {
      const unknownError = new Error("DB is down");
      mockHashPassword.mockResolvedValueOnce("new-hash");
      mockRepo.updatePassword.mockRejectedValueOnce(unknownError);

      await expect(authService.resetPassword("user-1", "new-password")).rejects.toMatchObject({
        statusCode: 500,
        code: "PASSWORD_RESET_FAILED",
      });

      expect(mockRepo.clearPasswordResetToken).not.toHaveBeenCalled();
    });
  });
});
