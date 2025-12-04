import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { User } from "@/types/user";
import { JWT_SECRET } from "../env";
import { HttpError } from "../errors";

import { repo } from "./currentRepo";

const JWT_EXPIRES_IN = "7d";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AuthResult = {
  user: User;
  token: string;
};

function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export const authService = {
  async register(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await repo.findByEmail(normalizedEmail);

    if (existing) {
      const err = new Error("Email already in use");
      // @ts-expect-error attach status for route handler
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await repo.createUser({
      email: normalizedEmail,
      passwordHash,
      role: "user",
    });

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await repo.findByEmail(normalizedEmail);
    if (!user) {
      const err = new Error("Invalid credentials");
      // @ts-expect-error
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch){
      throw new HttpError(401, "Invalid credentials");
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    try {
      await repo.updatePassword(userId, passwordHash);
    } catch (err: any) {
      if (err instanceof HttpError){
        throw err;
      }

      // anything else becomes a generic 500
      throw new HttpError(500, "Failed to update password");
    }
  }
};