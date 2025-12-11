import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/authService";
import { emailSchema, passwordSchema } from "@/lib/validation/authSchemas";
import { logAuthEvent } from "@/lib/logger";
import { NODE_ENV } from "@/lib/env";
import { withApiRoute } from "@/lib/withApiRoute";
import { checkRateLimit } from "@/lib/rateLimiter";
import { TooManyRequests } from "@/lib/errors";

const handler = async (req: Request): Promise<Response> => {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  const rate = checkRateLimit(`register:${ip}`, { max: 10, windowMs: 60_000 });

  if (!rate.allowed) {
    logAuthEvent("register_rate_limited", {
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

  const parsedEmail = emailSchema.parse(email);
  const parsedPassword = passwordSchema.parse(password);

  const result = await authService.register(parsedEmail, parsedPassword);

  const res = NextResponse.json(
    {
      user: result.user,
    },
    { status: 201 },
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

  logAuthEvent("register_success", { userId: result.user.id });

  return res;
};

export const POST = withApiRoute(handler);
