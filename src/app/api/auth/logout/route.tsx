import { NextResponse } from "next/server";
import { createApiError } from "@/lib/errors";
import { logAuthEvent } from "@/lib/logger";

export async function POST() {
  try {
    const res = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("access_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      secure: isProd,
      sameSite: "lax",
    });

    res.cookies.set("refresh_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      secure: isProd,
      sameSite: "lax",
    });

    logAuthEvent("logout_success");

    return res;
  } catch (error: any) {
    logAuthEvent("logout_unexpected_error", {
      error: error?.message ?? "Unknown error",
    });

    const apiError = createApiError(500, "Failed to logout", "LOGOUT_FAILED");

    return NextResponse.json(apiError, { status: apiError.status });
  }
}
