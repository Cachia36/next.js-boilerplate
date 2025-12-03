"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";

import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { EmailField } from "./EmailField";
import { PasswordField } from "./PasswordField";
import { registerRequest } from "@/lib/auth/authClient";

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function RegisterCard() {
  const router = useRouter();
  const { login } = useAuth();

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

      const data = await registerRequest(email, password);
      login(data.user);
      router.push("/");
    } catch (err: any) {
      setFormMessage(
        err?.message ?? "Failed to create your account. Please try again."
      );
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
            "bg-foreground/15"
          )}
        >
          <UserPlus className="w-5 h-5" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">Create an account</h2>

        <p className="mt-1 text-xs text-center px-10 text-foreground/80">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit
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
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full mt-1 rounded-3xl bg-foreground text-background py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2",
              "hover:bg-foreground/80",
              isSubmitting && "opacity-70 cursor-not-allowed hover:bg-foreground"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>Get Started</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <span className="h-px flex-1 bg-foreground" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-foreground">
              Already have an account?
            </span>
            <span className="h-px flex-1 bg-foreground" />
          </div>

          {/* Bottom link */}
          <div className="text-[10px] text-center">
            <Link
              href="/login"
              className="text-xs font-medium text-foreground/60 hover:text-foreground/90"
            >
              Click here to log in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}