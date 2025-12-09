import type { UserRole } from "./user";

export type AuthTokenPayload = {
  sub: string; // user id
  email: string;
  role: UserRole;
  createdAt: string; // always store as ISO string
  iat?: number; // issued at (added by jwt)
  exp?: number; // expiry (added by jwt)
};
