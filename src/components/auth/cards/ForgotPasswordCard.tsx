"use client";

import { useState } from "react";
import { Loader2, KeyRound, MailCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { validateEmail } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { EmailField } from "../fields/EmailField";
import { forgotPasswordRequest } from "@/lib/auth/authClient";

type FieldErrors = {
  email?: string;
};

export function ForgotPasswordCard() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [hasSentResetEmail, setHasSentResetEmail] = useState(false);

  const clearFormMessage = () => setFormMessage(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const emailErr = validateEmail(email);
    const nextErrors: FieldErrors = { email: emailErr };

    if (Object.values(nextErrors).some(Boolean)) {
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      clearFormMessage();
      setHasSentResetEmail(false);

      await forgotPasswordRequest(email);

      setHasSentResetEmail(true);
    } catch (err: any) {
      setFormMessage(err?.message ?? "Failed to send reset email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccess = hasSentResetEmail;

  return (
    <div
      className={cn(
        "w-full max-w-sm overflow-hidden rounded-3xl border shadow-xl",
        "transition-all duration-300 ease-out",
        "hover:border-foreground/50 hover:-translate-y-[2px] hover:shadow-2xl",
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-xl transition-all duration-300 ease-out",
            showSuccess ? "bg-emerald-500/15 text-emerald-500" : "bg-foreground/15",
          )}
        >
          {showSuccess ? <MailCheck className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          {showSuccess ? "Email sent" : "Forgot password"}
        </h2>

        <p className="text-foreground/80 mt-1 px-10 text-center text-xs">
          {showSuccess
            ? "If an account exists for this email, we've sent a password reset link."
            : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 px-6 pt-2 pb-6" noValidate>
        <div className="space-y-3">
          {/* Form-level message */}
          {formMessage && <p className="px-1 text-center text-xs text-red-500">{formMessage}</p>}

          {/* Email */}
          <EmailField
            value={email}
            error={fieldErrors.email}
            onChange={(value) => {
              setEmail(value);

              if (fieldErrors.email) {
                setFieldErrors((prev) => ({
                  ...prev,
                  email: validateEmail(value),
                }));
              }

              if (formMessage) {
                clearFormMessage();
              }

              if (hasSentResetEmail) {
                setHasSentResetEmail(false);
              }
            }}
            onBlur={(value) => {
              const err = validateEmail(value);
              setFieldErrors((prev) => ({
                ...prev,
                email: err,
              }));
            }}
          />

          {/* Primary button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "flex w-full items-center justify-center gap-2 py-2.5 font-semibold transition",
              "hover:bg-foreground/80",
              isSubmitting && "hover:bg-foreground cursor-not-allowed opacity-70",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>Send Email</>
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <span className="bg-foreground h-px flex-1" />
            <span className="text-foreground text-[10px] tracking-[0.18em] uppercase">...</span>
            <span className="bg-foreground h-px flex-1" />
          </div>

          {/* Bottom link */}
          <div className="text-center text-[10px]">
            <Link
              href="/login"
              className="text-foreground/60 hover:text-foreground/90 text-xs font-medium"
            >
              Return to login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
