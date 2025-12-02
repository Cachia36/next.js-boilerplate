import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UserRepository } from "./userRepository";
import { memoryUserRepository } from "./userRepository.memory";
import type { User } from "@/types/user";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-me";
const JWT_EXPIRES_IN = "7d";

// Swap this later to Mongo/Postgres implementation
const repo: UserRepository = memoryUserRepository;

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
    if (!isMatch) {
      const err = new Error("Invalid credentials");
      // @ts-expect-error
      err.statusCode = 401;
      throw err;
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
      if(!err.statusCode){
        err.statusCode = 500;
      }
      throw err;
    }
  }
};