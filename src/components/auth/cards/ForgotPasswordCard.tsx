"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MailQuestion, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/core/utils";
import { EmailField } from "../fields/EmailField";
import { validateEmail } from "@/lib/auth/domain/validation/auth";
import { forgotPasswordRequest } from "@/lib/auth/client/authClient";

type ApiError = Error & { statusCode?: number };

export function ForgotPasswordCard() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const clearFormMessage = () => setFormMessage(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldError(emailErr);
      return;
    }

    try {
      setIsSubmitting(true);
      clearFormMessage();
      setShowSuccess(false);

      await forgotPasswordRequest(email);

      setShowSuccess(true);
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.statusCode === 429) {
        setFormMessage("Too many requests. Please wait and try again.");
      } else {
        setFormMessage(error.message ?? "Unable to send reset email");
      }
    } finally {
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
          <MailQuestion className="h-6 w-6" />
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Forgot your password?</h2>

        <p className="text-muted-foreground mt-2 max-w-[320px] px-4 text-center text-sm leading-relaxed">
          Enter the email you used to sign up and we&apos;ll send you a secure link to reset your
          password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-10" noValidate>
        {formMessage && <p className="text-error px-1 text-center text-sm">{formMessage}</p>}

        <EmailField
          value={email}
          error={fieldError}
          onChange={(value) => {
            setEmail(value);
            if (fieldError) {
              setFieldError(validateEmail(value));
            }
            if (formMessage) clearFormMessage();
          }}
          onBlur={(value) => {
            setFieldError(validateEmail(value));
          }}
        />

        {/** Success/info message */}
        <div
          className={cn(
            "mt-1 rounded-xl border px-3 py-2 text-xs leading-relaxed transition-colors",
            showSuccess
              ? "border-success/70 bg-success/15 text-success"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {showSuccess
            ? "If an account exists for that email, a reset link has been sent. Please check your inbox and spam folder."
            : "You will receive an email with a password reset link if there is an account associated with this address."}
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
              Sending reset link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 pt-4">
          <span className="bg-border h-px w-full" />
          <span className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
            Remembered it?
          </span>
          <span className="bg-border h-px w-full" />
        </div>

        {/* Back to login */}
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
