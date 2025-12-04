import { DbUser } from "@/types/user";
import { UserRepository, CreateUserInput } from "./userRepository";
import crypto from "crypto"
import { HttpError } from "../errors";

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
            throw new HttpError(404, "User does not exist");
        }

        user.passwordHash = passwordHash;
    }

};

export const __memoryUserRepoTestUtils = {
    reset() {
        users = [];
    },
};