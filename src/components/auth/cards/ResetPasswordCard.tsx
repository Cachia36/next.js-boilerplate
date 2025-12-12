"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/core/utils";
import { PasswordField } from "../fields/PasswordField";
import { validatePassword, validateConfirmPassword } from "@/lib/auth/domain/validation/auth";
import { resetPasswordRequest } from "@/lib/auth/client/authClient";

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

type ApiError = Error & { statusCode?: number };

export function ResetPasswordCard() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const clearFormMessage = () => setFormMessage(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Reject missing or short token BEFORE calling API
    if (!token || token.length < 16) {
      setFormMessage("This reset link is invalid or has expired.");
      return;
    }

    const errors: FieldErrors = {
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };

    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      clearFormMessage();
      setIsResetSuccess(false);

      await resetPasswordRequest(token, password);

      setIsResetSuccess(true);

      // Auto-redirect after short delay
      setTimeout(() => {
        // Earlier I was using router.push, but for some reason buttons were not showing properly (e.g logged in users seeing sign in button instead of sign out)
        window.location.href = "/login";
      }, 1800);
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.statusCode === 429) {
        setFormMessage("Too many attempts. Please wait and try again.");
      } else {
        setFormMessage(error.message ?? "Unable to reset password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTokenInvalid = !token || token.length < 16;

  return (
    <div
      className={cn(
        "border-border bg-background/90 w-full max-w-md rounded-3xl border shadow-lg transition-all duration-300 ease-out",
        "hover:border-foreground/20 hover:shadow-xl",
        isResetSuccess &&
          // subtle success glow + tiny scale up
          "border-success/70 shadow-success/20 ring-success/40 scale-[1.01] shadow-lg ring-2",
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-10 pb-6">
        <div
          className={cn(
            "bg-muted text-foreground ring-border flex h-14 w-14 items-center justify-center rounded-2xl text-lg shadow-sm ring-1 transition-colors duration-300",
            isResetSuccess &&
              "bg-success/15 text-success ring-success/60 animate-in fade-in-zoom-in-95",
          )}
        >
          <ShieldCheck className="h-6 w-6" />
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Set a new password</h2>

        <p className="text-muted-foreground mt-2 max-w-[320px] px-4 text-center text-sm leading-relaxed">
          Choose a strong password. After resetting, you’ll be redirected to the login screen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-10" noValidate>
        {(formMessage || isTokenInvalid) && (
          <p className="text-error px-1 text-center text-sm">
            {formMessage ?? "This reset link is invalid or has expired. Please request a new one."}
          </p>
        )}

        <PasswordField
          value={password}
          error={fieldErrors.password}
          placeholder="New password"
          show={showPassword}
          onChange={(value) => {
            setPassword(value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({
                ...prev,
                password: validatePassword(value),
              }));
            }
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: validateConfirmPassword(value, confirmPassword),
              }));
            }
            if (formMessage) clearFormMessage();
          }}
          onBlur={(value) => {
            const err = validatePassword(value);
            setFieldErrors((prev) => ({ ...prev, password: err }));
          }}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          errorId="reset-password-error"
        />

        <PasswordField
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          placeholder="Confirm new password"
          show={showConfirm}
          onChange={(value) => {
            setConfirmPassword(value);
            setFieldErrors((prev) => ({
              ...prev,
              confirmPassword: validateConfirmPassword(password, value),
            }));
            if (formMessage) clearFormMessage();
          }}
          onBlur={(value) => {
            const err = validateConfirmPassword(password, value);
            setFieldErrors((prev) => ({ ...prev, confirmPassword: err }));
          }}
          onToggleShow={() => setShowConfirm((prev) => !prev)}
          errorId="reset-confirm-password-error"
        />

        {/* Success / Info Box */}
        <div
          className={cn(
            "mt-1 rounded-xl border px-3 py-2 text-xs leading-relaxed transition-colors",
            isResetSuccess
              ? "border-success/70 bg-success/15 text-success animate-in fade-in slide-in-from-top-1"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {isResetSuccess
            ? "Password updated successfully! Redirecting to login..."
            : "After resetting, your account will be secured with your new password."}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isTokenInvalid || isResetSuccess}
          className={cn(
            "mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full text-base font-semibold transition-all",
            (isSubmitting || isTokenInvalid || isResetSuccess) && "cursor-not-allowed opacity-70",
          )}
        >
          {isResetSuccess ? (
            // button is disabled, just show final state
            "Redirecting…"
          ) : isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Updating password...
            </>
          ) : (
            "Reset password"
          )}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 pt-4">
          <span className="bg-border h-px w-full" />
          <span className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">Back</span>
          <span className="bg-border h-px w-full" />
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            Return to login
          </Link>
        </div>
      </form>
    </div>
  );
}
