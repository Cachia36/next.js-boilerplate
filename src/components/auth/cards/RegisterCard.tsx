"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";

import { validateEmail, validatePassword, validateConfirmPassword } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { EmailField } from "../fields/EmailField";
import { PasswordField } from "../fields/PasswordField";
import { registerRequest } from "@/lib/auth/authClient";
import { Button } from "@/components/ui/Button";

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function RegisterCard() {
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const clearFormMessage = () => setFormMessage(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);

    const nextErrors: FieldErrors = {
      email: emailErr,
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

      await registerRequest(email, password);

      router.push("/");
    } catch (err: any) {
      setFormMessage(err?.message ?? "Failed to create your account. Please try again.");
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
            "bg-foreground/15",
          )}
        >
          <UserPlus className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">Create an account</h2>

        <p className="text-foreground/80 mt-1 px-10 text-center text-xs">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit
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
            }}
            onBlur={(value) => {
              const err = validateEmail(value);
              setFieldErrors((prev) => ({
                ...prev,
                email: err,
              }));
            }}
          />

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
                <span>Creating account...</span>
              </>
            ) : (
              <>Get Started</>
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <span className="bg-foreground h-px flex-1" />
            <span className="text-foreground text-[10px] tracking-[0.18em] uppercase">
              Already have an account?
            </span>
            <span className="bg-foreground h-px flex-1" />
          </div>

          {/* Bottom link */}
          <div className="text-center text-[10px]">
            <Link
              href="/login"
              className="text-foreground/60 hover:text-foreground/90 text-xs font-medium"
            >
              Click here to log in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
