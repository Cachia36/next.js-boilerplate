import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { repo } from "@/lib/auth/currentRepo";
import { sendPasswordResetEmail } from "@/lib/email/emailService";
import { JWT_SECRET, APP_URL } from "@/lib/env";

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
        const user = await repo.findByEmail(normalizedEmail);

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
            { expiresIn: "15m" }
        );

        const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(normalizedEmail, resetLink);

        const responseBody: any = { message: "Reset link created" };
        if (process.env.NODE_ENV !== "production") {
            responseBody.resetToken = resetToken;
        }
        return NextResponse.json(responseBody, { status: 200 });

    } catch (error: any) {
        const message = error?.message ?? "Failed to send reset email";
        return NextResponse.json({ message }, { status: 500 });
    }
}