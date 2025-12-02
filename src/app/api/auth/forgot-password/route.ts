import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { memoryUserRepository as repo } from "@/lib/auth/userRepository.memory"; // or use your interface

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-me";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body ?? {};

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log("Incoming forgot password request:", normalizedEmail);
    const user = await repo.findByEmail(normalizedEmail);
    console.log("User found:", !!user);
    
    if (user) {
    console.log("Creating reset token for user:", user.id);
    }
    if (!user) {
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    const resetToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: "password-reset",
      },
      JWT_SECRET,
      { expiresIn: "15m" } // 15 minutes
    );

    return NextResponse.json(
      {
        message: "Reset link created",
        resetToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const message = error?.message ?? "Failed to send reset email";
    return NextResponse.json({ message }, { status: 500 });
  }
}