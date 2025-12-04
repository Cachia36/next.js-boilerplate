import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/authService";
import { HttpError } from "@/lib/errors";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (process.env.NODE_ENV !== "production") {
            console.log("LOGIN BODY:", body);
        }
        const { email, password } = body ?? {};

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }
        const result = await authService.login(email, password);

        return NextResponse.json(
            {
                user: result.user,
                token: result.token,
            },
            { status: 200 }
        );
    } catch (error: any) {
        const status = error instanceof HttpError ? error.statusCode : 401;
        const message = error?.message ?? "Invalid credentials";

        return NextResponse.json({ message }, { status });
    }
}