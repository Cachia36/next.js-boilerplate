import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/authService";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-me";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body ?? {};

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    let payload: any;
    try{
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const userId = payload.sub as string | undefined;
    if(!userId){
      return NextResponse.json(
        { message: "Invalid token payload" },
        { status: 400 }
      );
    }

    await authService.resetPassword(userId, password);

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error: any ){
    const status = error?.statusCode ?? 500;
    const message = error?.message ?? "Failed to reset password";
    return NextResponse.json({ message }, { status });
  }
}
