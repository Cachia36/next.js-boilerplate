import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/authService";
import { emailSchema, passwordSchema } from "@/lib/validation/authSchemas";
import { ZodError } from "zod";
import { HttpError, createApiError } from "@/lib/errors";
import { logAuthEvent } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      const apiError = createApiError(400, "Email and password are required", "VALIDATION_ERROR");
      return NextResponse.json(apiError, { status: apiError.status });
    }

    const parsedEmail = emailSchema.parse(email);
    const parsedPassword = passwordSchema.parse(password);

    const result = await authService.register(parsedEmail, parsedPassword);

    const res = NextResponse.json(
      {
        user: result.user,
      },
      { status: 201 },
    );

    const isProd = process.env.NODE_ENV === "production";

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
      logAuthEvent("register_http_error", {
        statusCode: error.statusCode,
        code: error.code,
      });
      const apiError = createApiError(error.statusCode, error.message, error.code);
      return NextResponse.json(apiError, { status: apiError.status });
    }

    logAuthEvent("register_unexpected_error", {
      error: error?.message ?? "Unknown error",
    });

    const apiError = createApiError(
      500,
      "Unable to register with the provided details",
      "REGISTER_FAILED",
    );
    return NextResponse.json(apiError, { status: apiError.status });
  }
}
