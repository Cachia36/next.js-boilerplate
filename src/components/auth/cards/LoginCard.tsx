"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { validateEmail } from "@/lib/auth/domain/validation/auth";
import { cn } from "@/lib/core/utils";
import { EmailField } from "../fields/EmailField";
import { PasswordField } from "../fields/PasswordField";
import { loginRequest } from "@/lib/auth/client/authClient";

type FieldErrors = {
  email?: string;
  password?: string;
};

type ApiError = Error & { statusCode?: number };

export function LoginCard() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const clearFormMessage = () => setFormMessage(null);

  const validatePasswordForLogin = (value: string): string | undefined => {
    if (value.trim() === "") return "Password is required";
    return undefined;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent multiple rapid submits
    if (isSubmitting) return;

    const emailErr = validateEmail(email);
    const passwordErr = validatePasswordForLogin(password);

    const nextErrors: FieldErrors = { email: emailErr, password: passwordErr };

    // client-side validation errors
    if (Object.values(nextErrors).some(Boolean)) {
      setFieldErrors(nextErrors);
      return;
    }
    setIsSubmitting(true);
    clearFormMessage();

    try {
      await loginRequest(email, password);

      // On success -> DO NOT re-enable button
      // Keep it disabled until redirect completes
      window.location.href = "/";
    } catch (err: unknown) {
      const error = err as ApiError;

      if (error.statusCode === 429) {
        setFormMessage("Too many attempts. Please wait and try again.");
      } else {
        setFormMessage(error.message ?? "Failed to sign in");
      }

      // Allow retry only on error
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "border-border bg-background/90 w-full max-w-md rounded-3xl border shadow-lg",
        "transition-all duration-300 ease-out",
        "hover:border-foreground/20 hover:shadow-xl",
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-10 pb-6">
        <div className="bg-muted text-foreground ring-border flex h-14 w-14 items-center justify-center rounded-2xl text-lg shadow-sm ring-1">
          <LogIn className="h-6 w-6" />
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Welcome back</h2>

        <p className="text-muted-foreground mt-2 max-w-[300px] px-4 text-center text-sm leading-relaxed">
          Sign in to access your dashboard and continue where you left off.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-10" noValidate>
        {formMessage && <p className="text-error px-1 text-center text-sm">{formMessage}</p>}

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

            if (formMessage) clearFormMessage();
          }}
          onBlur={(value) => {
            const err = validateEmail(value);
            setFieldErrors((prev) => ({ ...prev, email: err }));
          }}
        />

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
                password: validatePasswordForLogin(value),
              }));
            }

            if (formMessage) clearFormMessage();
          }}
          onBlur={(value) => {
            const err = validatePasswordForLogin(value);
            setFieldErrors((prev) => ({ ...prev, password: err }));
          }}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          errorId="password-error"
        />

        <div className="-mt-2 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full text-base font-semibold",
            isSubmitting && "cursor-not-allowed opacity-70",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <div className="flex items-center gap-4 pt-4">
          <span className="bg-border h-px w-full" />
          <span className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">Or</span>
          <span className="bg-border h-px w-full" />
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            Create a new account
          </Link>
        </div>
      </form>
    </div>
  );
}
