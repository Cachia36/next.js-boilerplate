import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/authService";
import { HttpError, createApiError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rateLimiter";
import { logAuthEvent } from "@/lib/logger";
import { emailSchema, passwordSchema } from "@/lib/validation/authSchemas";
import { ZodError } from "zod";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  const rate = checkRateLimit(`login:${ip}`, { max: 10, windowMs: 60_000 });

  if (!rate.allowed) {
    const apiError = createApiError(
      429,
      "Too many login attempts. Please try again later.",
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
    const { email, password } = body ?? {};

    //Let Zod handle validation
    const parsedEmail = emailSchema.parse(email);
    const parsedPassword = passwordSchema.parse(password);

    const result = await authService.login(parsedEmail, parsedPassword);

    const res = NextResponse.json(
      {
        user: result.user,
      },
      { status: 200 },
    );

    const isProd = process.env.NODE_ENV === "production";

    // Set HttpOnly cookies for middleware-based protection
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

    return res;
  } catch (error: any) {
    if (error instanceof ZodError) {
      const apiError = createApiError(400, "Invalid email or password", "VALIDATION_ERROR");
      return NextResponse.json(apiError, { status: apiError.status });
    }

    if (error instanceof HttpError) {
      logAuthEvent("login_http_error", {
        statusCode: error.statusCode,
        code: error.code,
      });
      const apiError = createApiError(error.statusCode, error.message, error.code);
      return NextResponse.json(apiError, { status: apiError.status });
    }

    logAuthEvent("login_unexpected_error", {
      error: error?.message ?? "Unknown error",
    });

    const apiError = createApiError(
      500,
      "An unexpected error occurred while logging in",
      "AUTH_UNEXPECTED_ERROR",
    );

    return NextResponse.json(apiError, { status: apiError.status });
  }
}
