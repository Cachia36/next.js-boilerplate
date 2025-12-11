import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/domain/authService";
import { repo } from "@/lib/auth/repositories/currentRepo";
import { passwordSchema } from "@/lib/auth/domain/validation/authSchemas";
import { NotFound, TooManyRequests } from "@/lib/core/errors";
import { logAuthEvent } from "@/lib/core/logger";
import { withApiRoute } from "@/lib/http/withApiRoute";
import { checkRateLimit } from "@/lib/http/rateLimiter";
import { BadRequest } from "@/lib/core/errors";

const handler = async (req: Request): Promise<Response> => {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  const rate = checkRateLimit(`reset-password:${ip}`, { max: 10, windowMs: 60_000 });

  if (!rate.allowed) {
    logAuthEvent("reset-password_rate_limited", {
      ip,
      retryAfterSeconds: rate.retryAfterSeconds ?? 60,
    });

    throw TooManyRequests(
      "Too many reset attempts. Please try again later.",
      "RATE_LIMIT_EXCEEDED",
    );
  }
  const body = await req.json();
  const { token, password } = body ?? {};
  if (!token) {
    // Business-level validation (not just field shape)
    throw BadRequest("Token is required", "VALIDATION_ERROR");
  }

  const parsedPassword = passwordSchema.parse(password);

  const user = await repo.findByPasswordResetToken(token);
  if (!user) {
    throw NotFound("Invalid or expired reset token", "TOKEN_INVALID");
  }

  await authService.resetPassword(user.id, parsedPassword);

  logAuthEvent("password_reset_completed", { userId: user.id });

  return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
};

export const POST = withApiRoute(handler);
