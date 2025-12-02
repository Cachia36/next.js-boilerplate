export type UserRole = "user" | "admin";

export interface User {
    id: string,
    email: string,
    role: UserRole;
    createdAt?: string;
}

export interface DbUser extends User {
    passwordHash: string;
}