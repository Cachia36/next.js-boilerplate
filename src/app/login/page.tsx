"use client";
import { LoginCard } from "@/components/Auth/LoginCard";
import { useGuestOnly } from "@/hooks/useGuestOnly";

export default function LoginPage() {
  const canRender = useGuestOnly("/");

  if (!canRender) return null;

  return (
    <div className="flex-1 flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <LoginCard />
    </div>
  );
}