import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required").optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  EMAIL_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000"),
  EMAIL_API_KEY: process.env.EMAIL_API_KEY,
});

if (!parsed.success) {
  // Fail fast in production
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables", parsed.error.flatten());
  throw new Error("Invalid environment variables");
}

const env = parsed.data;

export const NODE_ENV = env.NODE_ENV;
export const JWT_SECRET = env.JWT_SECRET;
export const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET ?? env.JWT_SECRET;
export const APP_URL =
  env.NEXT_PUBLIC_APP_URL ?? (NODE_ENV === "development" ? "http://localhost:3000" : "");
export const EMAIL_API_KEY = env.EMAIL_API_KEY;
