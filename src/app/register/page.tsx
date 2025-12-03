"use client"

import { RegisterCard } from "@/components/Auth/RegisterCard";

export default function LoginPage() {
    return (
        <div className="flex-1 flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <RegisterCard />
        </div>
    );
}