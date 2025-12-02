import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/authService";

export async function POST(req: Request){
    try {
        const body = await req.json();
        const { email, password } = body ?? {};

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        //Optional: backend validation to mirror frontend
        if (password.trim().length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const result = await authService.register(email, password);

        return NextResponse.json(
            {
                user: result.user,
                token: result.token,
            },
            { status: 201 }
        );
    } catch (error: any) {
        const status = error?.statusCode ?? 400;
        const message = 
            error?.message ?? "Unable to register with the provided details";

        return NextResponse.json(
            { message },
            { status, }
        );
    }
}