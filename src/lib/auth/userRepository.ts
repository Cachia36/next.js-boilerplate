import type { DbUser, UserRole } from "@/types/user";

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  role: UserRole;
};

export interface UserRepository {
  findByEmail(email: string): Promise<DbUser | null>;
  findById(id: string): Promise<DbUser | null>;
  createUser(data: CreateUserInput): Promise<DbUser>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  // Password reset token storage
  setPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  findByPasswordResetToken(token: string): Promise<DbUser | null>;
  clearPasswordResetToken(userId: string): Promise<void>;
}
