import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/authService";
import { repo } from "@/lib/auth/currentRepo";
import { passwordSchema } from "@/lib/validation/authSchemas";
import { ZodError } from "zod";
import { HttpError, createApiError } from "@/lib/errors";
import { logAuthEvent } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body ?? {};

    if (!token || !password) {
      const apiError = createApiError(400, "Token and password are required", "VALIDATION_ERROR");
      return NextResponse.json(apiError, { status: apiError.status });
    }

    const parsedPassword = passwordSchema.parse(password);

    const user = await repo.findByPasswordResetToken(token);
    if (!user) {
      throw new HttpError(400, "Invalid or expired reset token", "TOKEN_INVALID");
    }

    await authService.resetPassword(user.id, parsedPassword);

    logAuthEvent("password_reset_completed", { userId: user.id });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const apiError = createApiError(400, "Invalid password", "VALIDATION_ERROR");
      return NextResponse.json(apiError, { status: apiError.status });
    }

    if (error instanceof HttpError) {
      const apiError = createApiError(error.statusCode, error.message, error.code);
      return NextResponse.json(apiError, { status: apiError.status });
    }

    logAuthEvent("password_reset_unexpected_error", {
      error: error?.message ?? "Unknown error",
    });

    const apiError = createApiError(500, "Failed to reset password", "PASSWORD_RESET_FAILED");
    return NextResponse.json(apiError, { status: apiError.status });
  }
}
