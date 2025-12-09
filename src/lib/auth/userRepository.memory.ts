import crypto from "crypto";
import { DbUser } from "@/types/user";
import { UserRepository, CreateUserInput } from "./userRepository";
import { HttpError } from "../errors";

const globalForUsers = globalThis as unknown as {
  __memoryUsers?: DbUser[];
};

const users: DbUser[] = globalForUsers.__memoryUsers ?? [];
if (!globalForUsers.__memoryUsers) {
  globalForUsers.__memoryUsers = users;
}

export const memoryUserRepository: UserRepository = {
  async findByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    return users.find((u) => u.email === normalizedEmail) || null;
  },

  async findById(id) {
    return users.find((u) => u.id === id) || null;
  },

  async createUser(data: CreateUserInput) {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new HttpError(409, "User already exists", "AUTH_EMAIL_ALREADY_EXISTS");
    }

    const user: DbUser = {
      id: crypto.randomUUID(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      passwordHash: data.passwordHash,
      createdAt: new Date().toISOString(),
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    };

    users.push(user);
    return user;
  },

  async updatePassword(userId, passwordHash) {
    const user = users.find((u) => u.id === userId);

    if (!user) {
      throw new HttpError(404, "User does not exist", "USER_NOT_FOUND");
    }

    user.passwordHash = passwordHash;
  },

  async setPasswordResetToken(userId, token, expiresAt) {
    const user = users.find((u) => u.id === userId);

    if (!user) {
      throw new HttpError(404, "User does not exist", "USER_NOT_FOUND");
    }

    user.passwordResetToken = token;
    user.passwordResetExpiresAt = expiresAt.toISOString();
  },

  async findByPasswordResetToken(token) {
    const now = Date.now();
    return (
      users.find((u) => {
        if (!u.passwordResetToken || !u.passwordResetExpiresAt) return false;
        if (u.passwordResetToken !== token) return false;
        const expiresAt = new Date(u.passwordResetExpiresAt).getTime();
        return expiresAt > now;
      }) || null
    );
  },

  async clearPasswordResetToken(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
  },
};

export const __memoryUserRepoTestUtils = {
  reset() {
    // INSTEAD: clear the existing shared array
    users.length = 0;
  },
};
