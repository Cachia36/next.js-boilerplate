"use client"

import { ForgotPasswordCard } from "@/components/Auth/ForgotPasswordCard";
import { useGuestOnly } from "@/hooks/useGuestOnly"

export default function forgotPassword() {
    const canRender = useGuestOnly("/");

    if (!canRender) return null; // don't show anything until we know it's a guest

    return (
        <div className="flex-1 flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ForgotPasswordCard />
        </div>
    )
}