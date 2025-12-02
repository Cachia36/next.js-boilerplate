import type { DbUser, UserRole } from "@/types/user";

export type CreateUserInput = {
    email: string;
    passwordHash: string;
    role: UserRole;
}

export interface UserRepository {
    findByEmail(email: string): Promise<DbUser | null>;
    createUser(data: CreateUserInput): Promise<DbUser>;
    updatePassword(userId: string, passwordHash: string): Promise<void>
}