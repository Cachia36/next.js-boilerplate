import { DbUser } from "@/types/user";
import { UserRepository, CreateUserInput } from "./userRepository";
import crypto from "crypto"
import { error } from "console";

let users: DbUser[] = [];

export const memoryUserRepository: UserRepository = { 
    async findByEmail(email) {
        const normalizedEmail = email.trim().toLowerCase();

        return users.find((u) => u.email === normalizedEmail) || null;
    },

    async createUser(data: CreateUserInput) {
        const user: DbUser = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ...data,
        };

        users.push(user);
        return user;
    },

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        const user = users.find((u) => u.id === userId);

        if (!user) {
            const err = new Error("User does not exist");
            // @ts-expect-error attach status for route handler if you want
            err.statusCode = 404;
            throw err;
        }

        user.passwordHash = passwordHash;
    }

};