// src/components/auth/ResetPasswordCard.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { validatePassword, validateConfirmPassword } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { PasswordField } from "../fields/PasswordField";
import { resetPasswordRequest } from "@/lib/auth/authClient";

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

export function ResetPasswordCard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // read token from the URL query string
  const resetToken = searchParams.get("token");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const clearFormMessage = () => setFormMessage(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isResetSuccess) return;

    if (!resetToken) {
      setFormMessage("This reset link is invalid or missing a token.");
      return;
    }

    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);

    const nextErrors: FieldErrors = {
      password: passwordErr,
      confirmPassword: confirmErr,
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      clearFormMessage();

      // send the actual token from the URL
      await resetPasswordRequest(resetToken, password);

      setIsResetSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setFormMessage(err?.message ?? "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            isResetSuccess ? "bg-emerald-500/15 text-emerald-500" : "bg-foreground/15",
          )}
        >
          {isResetSuccess ? <CheckCircle2 className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          {isResetSuccess ? "Success!" : "Reset password"}
        </h2>

        <p className="text-foreground/80 mt-1 px-10 text-center text-xs">
          {isResetSuccess
            ? "Redirecting to login"
            : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 px-6 pt-2 pb-6" noValidate>
        <div className="space-y-3">
          {formMessage && <p className="px-1 text-center text-xs text-red-500">{formMessage}</p>}

          <PasswordField
            value={password}
            error={fieldErrors.password}
            placeholder="Password"
            show={showPassword}
            onChange={(value) => {
              setPassword(value);

              if (fieldErrors.password) {
                setFieldErrors((prev) => ({
                  ...prev,
                  password: validatePassword(value),
                }));
              }

              if (formMessage) {
                clearFormMessage();
              }
            }}
            onBlur={(value) => {
              const err = validatePassword(value);
              setFieldErrors((prev) => ({
                ...prev,
                password: err,
              }));
            }}
            onToggleShow={() => setShowPassword((prev) => !prev)}
            errorId="password-error"
          />

          <PasswordField
            value={confirmPassword}
            error={fieldErrors.confirmPassword}
            placeholder="Confirm password"
            show={showConfirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);

              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({
                  ...prev,
                  confirmPassword: validateConfirmPassword(value, password),
                }));
              }

              if (formMessage) {
                clearFormMessage();
              }
            }}
            onBlur={(value) => {
              const err = validateConfirmPassword(value, password);
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: err,
              }));
            }}
            onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
            errorId="confirm-password-error"
          />

          <Button
            type="submit"
            disabled={isSubmitting || isResetSuccess}
            className={cn(
              "flex w-full items-center justify-center gap-2 py-2.5 font-semibold transition",
              "hover:bg-foreground/80",
              (isSubmitting || isResetSuccess) &&
                "hover:bg-foreground cursor-not-allowed opacity-70",
            )}
          >
            {isSubmitting || isResetSuccess ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isResetSuccess ? "Redirecting..." : "Resetting..."}</span>
              </>
            ) : (
              <>Reset password</>
            )}
          </Button>

          <div className="flex items-center gap-3 pt-2">
            <span className="bg-foreground h-px flex-1" />
            <span className="text-foreground text-[10px] tracking-[0.18em] uppercase">...</span>
            <span className="bg-foreground h-px flex-1" />
          </div>

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
