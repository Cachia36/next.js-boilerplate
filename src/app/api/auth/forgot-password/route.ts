import { NextResponse } from "next/server";
import crypto from "crypto";
import { repo } from "@/lib/auth/currentRepo";
import { sendPasswordResetEmail } from "@/lib/email/emailService";
import { APP_URL } from "@/lib/env";
import { createApiError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rateLimiter";
import { logAuthEvent } from "@/lib/logger";
import { emailSchema } from "@/lib/validation/authSchemas";
import { ZodError } from "zod";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  const rate = checkRateLimit(`forgot-password:${ip}`, {
    max: 5,
    windowMs: 15 * 60_000,
  });

  if (!rate.allowed) {
    const apiError = createApiError(
      429,
      "Too many reset attempts. Please try again later.",
      "RATE_LIMIT_EXCEEDED",
    );
    return NextResponse.json(apiError, {
      status: apiError.status,
      headers: {
        "Retry-After": String(rate.retryAfterSeconds ?? 60),
      },
    });
  }

  try {
    const body = await req.json();
    const { email } = body ?? {};

    const parsedEmail = emailSchema.parse(email);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await repo.findByEmail(normalizedEmail);

    // Always respond success to avoid leaking user existence
    if (!user) {
      logAuthEvent("forgot_password_nonexistent_email", {
        email: normalizedEmail,
      });
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent." },
        { status: 200 },
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60_000); // 30 min

    await repo.setPasswordResetToken(user.id, resetToken, expiresAt);

    const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(normalizedEmail, resetLink);

    logAuthEvent("forgot_password_requested", { userId: user.id });

    const responseBody: any = {
      message: "If that email exists, a reset link has been sent.",
    };

    if (process.env.NODE_ENV !== "production") {
      responseBody.resetToken = resetToken;
    }

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const apiError = createApiError(
        400,
        "Please enter a valid email address",
        "VALIDATION_ERROR",
      );
      return NextResponse.json(apiError, { status: apiError.status });
    }

    logAuthEvent("forgot_password_unexpected_error", {
      error: error?.message ?? "Unknown error",
    });

    const apiError = createApiError(500, "Failed to send reset email", "RESET_EMAIL_FAILED");
    return NextResponse.json(apiError, { status: apiError.status });
  }
}
