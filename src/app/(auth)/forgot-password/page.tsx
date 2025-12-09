"use client";

import { ForgotPasswordCard } from "@/components/auth/cards/ForgotPasswordCard";

export default function forgotPassword() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 items-center justify-center p-4 duration-300">
      <ForgotPasswordCard />
    </div>
  );
}
