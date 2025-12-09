import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  const cookieToken = req.cookies.get("access_token")?.value;
  const headerAuth = req.headers.get("authorization");
  const headerToken = headerAuth?.startsWith("Bearer ") ? headerAuth.slice(7) : undefined;

  const accessToken = cookieToken ?? headerToken;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const isDashboard = pathname.startsWith("/dashboard");

  // 1) Guest-only routes: login/register/forgot/reset
  if (isAuthPage) {
    // If user has ANY access_token, treat them as logged in and send to dashboard
    if (accessToken) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // No token -> guest -> allow access
    return NextResponse.next();
  }

  // 2) Protected routes: /dashboard/**
  if (isDashboard) {
    // No token -> force login
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Token exists -> treat as authenticated, let API routes verify signature
    const res = NextResponse.next();
    // Optionally, you can just pass a flag header if you want
    // res.headers.set("x-has-access-token", "true");
    return res;
  }

  // 3) Everything else is public
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password", "/reset-password"],
};
