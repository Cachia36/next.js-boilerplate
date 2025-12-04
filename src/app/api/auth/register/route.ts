import { NextResponse } from "next/server";
import { authService } from "@/lib/auth/authService";
import { emailSchema, passwordSchema } from "@/lib/validation/authSchemas";
import { ZodError } from "zod";
import { HttpError } from "@/lib/errors";

export async function POST(req: Request) {
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
        try {
            emailSchema.parse(email);
            passwordSchema.parse(password);
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.issues[0]?.message ?? "Invalid input";
                return NextResponse.json({ message }, { status: 400 });
            }
            throw error;
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
        const status = error instanceof HttpError ? error.statusCode : 400;
        const message =
            error?.message ?? "Unable to register with the provided details";

        return NextResponse.json({ message }, { status });
    }

}