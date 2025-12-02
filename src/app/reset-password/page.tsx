"use client"

import { useSearchParams, useRouter } from "next/navigation"
import AuthCard from "@/components/AuthCard"

export default function resetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    return (
        <div className="min-h-screen flex justify-center items-center p-4">
            <AuthCard variant="resetpassword" resetToken={token ?? undefined} />
        </div>
    )
}