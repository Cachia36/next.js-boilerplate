// src/lib/auth/jwtService.ts
import jwt from "jsonwebtoken";
import type { User } from "@/types/user";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../env";
import { Unauthorized } from "../errors";
import { AuthTokenPayload } from "@/types/auth";

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

export function generateAccessToken(user: User): string {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt ?? new Date().toISOString(),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function generateRefreshToken(user: User): string {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt ?? new Date().toISOString(),
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    throw Unauthorized("Invalid or expired access token", "TOKEN_INVALID");
  }
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as AuthTokenPayload;
  } catch {
    throw Unauthorized("Invalid or expired refresh token", "REFRESH_TOKEN_INVALID");
  }
}
