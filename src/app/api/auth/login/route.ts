import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/domain/authService";
import { checkRateLimit } from "@/lib/http/rateLimiter";
import { logAuthEvent } from "@/lib/core/logger";
import { emailSchema, passwordSchema } from "@/lib/auth/domain/validation/authSchemas";
import { NODE_ENV } from "@/lib/core/env";
import { withApiRoute } from "@/lib/http/withApiRoute";
import { TooManyRequests } from "@/lib/core/errors";

const handler = async (req: Request): Promise<Response> => {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  const rate = checkRateLimit(`login:${ip}`, { max: 10, windowMs: 60_000 });

  if (!rate.allowed) {
    logAuthEvent("login_rate_limited", {
      ip,
      retryAfterSeconds: rate.retryAfterSeconds ?? 60,
    });

    throw TooManyRequests(
      "Too many reset attempts. Please try again later.",
      "RATE_LIMIT_EXCEEDED",
    );
  }

  const body = await req.json();
  const { email, password } = body ?? {};

  // Zod validation – errors handled globally by handleApiError
  const parsedEmail = emailSchema.parse(email);
  const parsedPassword = passwordSchema.parse(password);

  const result = await authService.login(parsedEmail, parsedPassword);

  const res = NextResponse.json(
    {
      user: result.user,
    },
    { status: 200 },
  );

  const isProd = NODE_ENV === "production";

  res.cookies.set("access_token", result.accessToken, {
    httpOnly: true,
    path: "/",
    maxAge: 15 * 60,
    secure: isProd,
    sameSite: "lax",
  });

  res.cookies.set("refresh_token", result.refreshToken, {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    secure: isProd,
    sameSite: "lax",
  });

  logAuthEvent("login_success", { userId: result.user.id, ip });

  return res;
};

export const POST = withApiRoute(handler);
