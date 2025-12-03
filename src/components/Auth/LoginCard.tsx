"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";

import { validateEmail, validatePassword } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { EmailField } from "./EmailField";
import { PasswordField } from "./PasswordField";
import { loginRequest } from "@/lib/auth/authClient";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginCard() {
  const router = useRouter();
  const { login } = useAuth();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const clearFormMessage = () => setFormMessage(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    const nextErrors: FieldErrors = { email: emailErr, password: passwordErr };

    if (Object.values(nextErrors).some(Boolean)) {
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      clearFormMessage();

      const data = await loginRequest(email, password);
      login(data.user);
      router.push("/");
    } catch (err: any) {
      setFormMessage(err?.message ?? "Failed to sign in");
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
          <LogIn className="w-5 h-5" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">Sign in with email</h2>

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

          {/* Forgot password link */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium hover:text-foreground/60"
            >
              Forgot password?
            </Link>
          </div>

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
                <span>Signing in...</span>
              </>
            ) : (
              <>Get Started</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <span className="h-px flex-1 bg-foreground" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-foreground">
              Don&apos;t have an account?
            </span>
            <span className="h-px flex-1 bg-foreground" />
          </div>

          {/* Bottom link */}
          <div className="text-[10px] text-center">
            <Link
              href="/register"
              className="text-xs font-medium text-foreground/60 hover:text-foreground/90"
            >
              Click here to register
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
