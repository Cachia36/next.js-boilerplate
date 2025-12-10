import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Required
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  // Optional at validation time
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required").optional(),

  // Optional, but must be a valid URL if provided
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Fully optional
  EMAIL_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,

  // IMPORTANT: do NOT fallback here
  // Let it be undefined so Zod treats it as optional.
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000"),

  EMAIL_API_KEY: process.env.EMAIL_API_KEY,
});

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten());
  throw new Error("Invalid environment variables");
}

const env = parsed.data;

export const NODE_ENV = env.NODE_ENV;
export const JWT_SECRET = env.JWT_SECRET;

// Fallback happens here, AFTER validation
export const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET ?? env.JWT_SECRET;

export const APP_URL =
  env.NEXT_PUBLIC_APP_URL ?? (NODE_ENV === "development" ? "http://localhost:3000" : "");

export const EMAIL_API_KEY = env.EMAIL_API_KEY;
