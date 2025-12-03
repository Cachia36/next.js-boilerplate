"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

import {
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { PasswordField } from "./PasswordField";
import { resetPasswordRequest } from "@/lib/auth/authClient";

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

type ResetPasswordCardProps = {
  resetToken?: string;
};

export function ResetPasswordCard({ resetToken }: ResetPasswordCardProps) {
  const router = useRouter();

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

      await resetPasswordRequest(resetToken ?? "mock-token-for-now", password);

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
        "w-full max-w-sm rounded-3xl border overflow-hidden shadow-xl",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-[2px] hover:shadow-2xl hover:border-foreground/50"
      )}
    >
      {/* Header */}
      <div className="pt-8 pb-4 flex flex-col items-center">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xl transition-all duration-300 ease-out",
            isResetSuccess ? "bg-emerald-500/15 text-emerald-500" : "bg-foreground/15"
          )}
        >
          {isResetSuccess ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <KeyRound className="w-5 h-5" />
          )}
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          {isResetSuccess ? "Success!" : "Reset password"}
        </h2>

        <p className="mt-1 text-xs text-center px-10 text-foreground/80">
          {isResetSuccess
            ? "Redirecting to login"
            : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit"}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="px-6 pb-6 pt-2 space-y-4"
        noValidate
      >
        <div className="space-y-3">
          {/* Form-level message */}
          {formMessage && (
            <p className="text-xs text-red-500 px-1 text-center">
              {formMessage}
            </p>
          )}

          {/* Password */}
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

          {/* Confirm password */}
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

          {/* Primary button */}
          <button
            type="submit"
            disabled={isSubmitting || isResetSuccess}
            className={cn(
              "w-full mt-1 rounded-3xl bg-foreground text-background py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2",
              "hover:bg-foreground/80",
              (isSubmitting || isResetSuccess) &&
                "opacity-70 cursor-not-allowed hover:bg-foreground"
            )}
          >
            {isSubmitting || isResetSuccess ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isResetSuccess ? "Redirecting..." : "Resetting..."}</span>
              </>
            ) : (
              <>Reset password</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <span className="h-px flex-1 bg-foreground" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-foreground">
              ...
            </span>
            <span className="h-px flex-1 bg-foreground" />
          </div>

          {/* Bottom link */}
          <div className="text-[10px] text-center">
            <Link
              href="/login"
              className="text-xs font-medium text-foreground/60 hover:text-foreground/90"
            >
              Return to login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
