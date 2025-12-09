// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/authService";
import { HttpError, createApiError } from "@/lib/errors";
import { logAuthEvent } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";

    const accessToken = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1];

    // Not authenticated → just return user: null with 200
    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await authService.getUserFromAccessToken(accessToken);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    // Token invalid or user missing → treat as logged out
    if (error instanceof HttpError && (error.statusCode === 401 || error.statusCode === 404)) {
      logAuthEvent("me_token_invalid_or_user_missing", {
        statusCode: error.statusCode,
        code: error.code,
      });

      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Real unexpected error
    logAuthEvent("me_unexpected_error", {
      error: error?.message ?? "Unknown error",
    });

    const apiError = createApiError(500, "Failed to fetch current user", "ME_UNEXPECTED_ERROR");

    return NextResponse.json(apiError, { status: apiError.status });
  }
}
