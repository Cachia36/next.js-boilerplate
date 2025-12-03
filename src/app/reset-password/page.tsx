"use client";

import { ResetPasswordCard } from "@/components/Auth/ResetPasswordCard";
import { useSearchParams } from "next/navigation";
import { useGuestOnly } from "@/hooks/useGuestOnly";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const canRender = useGuestOnly("/");

  if (!canRender) return null;

  return (
    <div className="flex-1 flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <ResetPasswordCard />
    </div>
  );
}