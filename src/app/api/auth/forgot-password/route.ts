import { NextResponse } from "next/server";
import crypto from "crypto";
import { repo } from "@/lib/auth/repositories/currentRepo";
import { sendPasswordResetEmail } from "@/lib/email/emailService";
import { APP_URL, NODE_ENV } from "@/lib/env";
import { checkRateLimit } from "@/lib/rateLimiter";
import { logAuthEvent } from "@/lib/logger";
import { emailSchema } from "@/lib/validation/authSchemas";
import { withApiRoute } from "@/lib/withApiRoute";
import { TooManyRequests } from "@/lib/errors";

const handler = async (req: Request): Promise<Response> => {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  const rate = checkRateLimit(`forgot-password:${ip}`, {
    max: 5,
    windowMs: 15 * 60_000,
  });

  if (!rate.allowed) {
    logAuthEvent("forgot_password_rate_limited", {
      ip,
      retryAfterSeconds: rate.retryAfterSeconds ?? 60,
    });

    throw TooManyRequests(
      "Too many reset attempts. Please try again later.",
      "RATE_LIMIT_EXCEEDED",
    );
  }

  const body = await req.json();
  const { email } = body ?? {};

  const parsedEmail = emailSchema.parse(email);
  const normalizedEmail = parsedEmail.trim().toLowerCase();

  const user = await repo.findByEmail(normalizedEmail);

  // Always respond success to avoid leaking user existence
  if (!user) {
    logAuthEvent("forgot_password_nonexistent_email", {
      email: normalizedEmail,
      ip,
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

  logAuthEvent("forgot_password_requested", { userId: user.id, ip });

  const responseBody: Record<string, unknown> = {
    message: "If that email exists, a reset link has been sent.",
  };

  if (NODE_ENV !== "production") {
    responseBody.resetToken = resetToken;
  }

  return NextResponse.json(responseBody, { status: 200 });
};

export const POST = withApiRoute(handler);
