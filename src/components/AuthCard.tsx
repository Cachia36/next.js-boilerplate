"use client";
import { LogIn, Mail, LockKeyhole, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AuthCardProps = {
    variant?: "signin" | "register" | "forgotpassword" | "resetpassword";
    resetToken?: string;
};

type LoginFormErrors = {
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string; // general error (e.g invalid credentials)
};

export default function AuthCard({ variant = "signin", resetToken }: AuthCardProps) {
    const router = useRouter();
    const [errors, setErrors] = useState<LoginFormErrors>({});

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmail = (value: string): string | undefined => {
        const trimmed = value.trim();

        if (!trimmed) return "Email is required";

        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!pattern.test(trimmed)) return "Please enter a valid email address";

        return undefined;
    };

    const validatePassword = (value: string): string | undefined => {
        const trimmed = value.trim();

        if (!trimmed) return "Password is required";
        if (trimmed.length < 8) return "Password must be at least 8 characters";

        if (!/[A-Z]/.test(trimmed))
            return "Password must contain at least one capital letter";

        if (!/[0-9]/.test(trimmed))
            return "Password must contain at least one number";

        return undefined;
    };

    const validateConfirmPassword = (
        value: string,
        password: string
    ): string | undefined => {
        const trimmed = value.trim();
        const trimmedPassword = password.trim();

        if (!trimmed) return "Please confirm your password";
        if (trimmed !== trimmedPassword) return "Passwords do not match";

        return undefined;
    };

    let title: string;
    if (variant === "register") {
        title = "Create an account";
    } else if (variant === "signin") {
        title = "Sign in with email";
    } else if (variant === "forgotpassword") {
        title = "Forgot password";
    } else {
        title = "Reset password";
    }

    let bottomLinkHref = "/login";
    let bottomLinkLabel = "Return to login";

    if (variant === "signin") {
        bottomLinkHref = "/register";
        bottomLinkLabel = "Click here to register";
    } else if (variant === "register") {
        bottomLinkHref = "/login";
        bottomLinkLabel = "Click here to log in";
    }

    // needs to be async because we use await inside
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return; // prevent double submits

        if (variant === "signin") {
            const emailErr = validateEmail(email);
            const passwordErr = validatePassword(password);

            const nextErrors: LoginFormErrors = {
                email: emailErr,
                password: passwordErr,
            };

            const hasErrors = Object.values(nextErrors).some(Boolean);
            if (hasErrors) {
                setErrors(nextErrors);
                return;
            }

            try {
                setIsSubmitting(true);
                // clear any old form-level error
                setErrors((prev) => ({ ...prev, form: undefined }));

                console.log("Submitting payload:", {
                    email: email.trim(),
                    passsword: password.trim(),
                });

                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password.trim(),
                    }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    const message = data?.message ?? "Failed to sign in";
                    setErrors((prev) => ({ ...prev, form: message }));
                    return;
                }

                const data = await res.json();
                console.log("Signed in:", data)

                // TODO:
                // - store token in localStorage/context/cookie
                // - redirect to dashboard
                // router.push("/dashboard")
            } catch (err) {
                setErrors((prev) => ({
                    ...prev,
                    form: "Something went wrong while signing in",
                }));
            } finally {
                setIsSubmitting(false);
            }

            return;
        }

        if (variant === "register") {
            const emailErr = validateEmail(email);
            const passwordErr = validatePassword(password);
            const confirmErr = validateConfirmPassword(confirmPassword, password);

            const nextErrors: LoginFormErrors = {
                email: emailErr,
                password: passwordErr,
                confirmPassword: confirmErr,
            };

            const hasErrors = Object.values(nextErrors).some(Boolean);
            if (hasErrors) {
                setErrors(nextErrors);
                return;
            }

            try {
                setIsSubmitting(true);
                setErrors((prev) => ({ ...prev, form: undefined }));

                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password.trim(),
                    }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    const message =
                        data?.message ?? "Failed to create your account. Please try again.";
                    setErrors((prev) => ({ ...prev, form: message }));
                    return;
                }

                const data = await res.json();
                console.log("Registered:", data);

                // TODO: 
                // - store token
                // - redirect
                // router.push("/dashboard");

            } catch (err) {
                setErrors((prev) => ({
                    ...prev,
                    form: "Something went wrong while creating your account",
                }))
            } finally {
                setIsSubmitting(false);
            }

            return;
        }

        if (variant === "forgotpassword") {
            const emailErr = validateEmail(email);

            const nextErrors: LoginFormErrors = { email: emailErr };

            const hasErrors = Object.values(nextErrors).some(Boolean);
            if (hasErrors) {
                setErrors(nextErrors);
                return;
            }

            try {
                setIsSubmitting(true);
                setErrors((prev) => ({ ...prev, form: undefined }));

                const res = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim() }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    const message = data?.message ?? "Failed to send reset email";
                    setErrors((prev) => ({ ...prev, form: message }));
                    return;
                }

                const data = await res.json();

                // For now: redirect to reset page with token in the URL
                if (data.resetToken) {
                    router.push(`/reset-password?token=${data.resetToken}`);
                } else {
                    // fallback if you later remove the token from the response
                    router.push("/reset-password");
                }
            } catch (err) {
                setErrors((prev) => ({
                    ...prev,
                    form: "Something went wrong while sending reset email",
                }));
            } finally {
                setIsSubmitting(false);
            }

            return;
        }

        if (variant === "resetpassword") {
            const passwordErr = validatePassword(password);
            const confirmErr = validateConfirmPassword(confirmPassword, password);

            const nextErrors: LoginFormErrors = {
                password: passwordErr,
                confirmPassword: confirmErr,
            };

            const hasErrors = Object.values(nextErrors).some(Boolean);
            if (hasErrors) {
                setErrors(nextErrors);
                return;
            }

            try {
                setIsSubmitting(true);
                setErrors((prev) => ({ ...prev, form: undefined }));

                const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token: resetToken ?? "mock-token-for-now", // prefer token from URL
                        password: password.trim(),
                    }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    const message = data?.message ?? "Failed to reset password";
                    setErrors((prev) => ({ ...prev, form: message }));
                    return;
                }

                router.push("/login");
            } catch (err) {
                setErrors((prev) => ({
                    ...prev,
                    form: "Something went wrong while resetting password",
                }));
            } finally {
                setIsSubmitting(false);
            }

            return;
        }
    };

    return (
        <div className="w-full max-w-sm rounded-3xl shadow-xl border overflow-hidden">
            {/* Header */}
            <div className="pt-8 pb-4 flex flex-col items-center">
                <div className="bg-foreground/15 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xl">
                    <LogIn />
                </div>

                <h2 className="mt-4 text-lg font-semibold">{title}</h2>

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
                    {/* Form-level error (e.g. invalid credentials) */}
                    {errors.form && (
                        <p
                            className={cn(
                                "text-xs text-red-500 px-1 text-center overflow-hidden transition-all duration-300 ease-out transform",
                                errors.form
                                    ? "max-h-10 opacity-100 translate-y-0"
                                    : "max-h-0 opacity-0 -translate-y-2"
                            )}
                        >
                            {errors.form}
                        </p>
                    )}

                    {/* Email – shown on all except resetpassword */}
                    {variant !== "resetpassword" && (
                        <div className="space-y-1">
                            <div
                                className={cn(
                                    "flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 transition-colors duration-200",
                                    errors.email && "border-red-500 focus-within:ring-red-500"
                                )}
                            >
                                <Mail />
                                <input
                                    type="email"
                                    className="w-full text-sm focus:outline-none placeholder:text-foreground/60"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEmail(value);

                                        if (errors.email) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                email: validateEmail(value),
                                            }));
                                        }

                                        if (errors.form) {
                                            setErrors((prev) => ({ ...prev, form: undefined }));
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const err = validateEmail(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            email: err,
                                        }));
                                    }}
                                    aria-invalid={!!errors.email}
                                    aria-describedby="email-error"
                                />
                            </div>

                            {/* Animated error */}
                            <p
                                id="email-error"
                                className={cn(
                                    "text-xs text-red-500 px-1 overflow-hidden transition-all duration-300 ease-out transform",
                                    errors.email
                                        ? "max-h-10 opacity-100 translate-y-0 mt-1"
                                        : "max-h-0 opacity-0 -translate-y-2 mt-0"
                                )}
                            >
                                {errors.email ?? " "}
                            </p>
                        </div>
                    )}

                    {/* Password – hidden on forgotpassword, shown on others */}
                    {variant !== "forgotpassword" && (
                        <div className="space-y-1">
                            <div
                                className={cn(
                                    "flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 transition-colors duration-200",
                                    errors.password && "border-red-500 focus-within:ring-red-500"
                                )}
                            >
                                <LockKeyhole />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full text-sm focus:outline-none placeholder:text-foreground/60"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPassword(value);

                                        if (errors.password) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                password: validatePassword(value),
                                            }));
                                        }

                                        if (errors.form) {
                                            setErrors((prev) => ({ ...prev, form: undefined }));
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const err = validatePassword(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            password: err,
                                        }));
                                    }}
                                    aria-invalid={!!errors.password}
                                    aria-describedby="password-error"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="flex items-center justify-center w-5 h-5"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            {/* Animated password error */}
                            <p
                                id="password-error"
                                className={cn(
                                    "text-xs text-red-500 px-1 overflow-hidden transition-all duration-200 transform",
                                    errors.password
                                        ? "max-h-10 opacity-100 translate-y-0 mt-1"
                                        : "max-h-0 opacity-0 -translate-y-1 mt-0"
                                )}
                            >
                                {errors.password ?? " "}
                            </p>
                        </div>
                    )}

                    {/* Confirm password field */}
                    {(variant === "resetpassword" || variant === "register") && (
                        <div className="space-y-1">
                            <div
                                className={cn(
                                    "flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 transition-colors duration-200",
                                    errors.confirmPassword &&
                                    "border-red-500 focus-within:ring-red-500"
                                )}
                            >
                                <LockKeyhole />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="w-full text-sm focus:outline-none placeholder:text-foreground/60"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setConfirmPassword(value);

                                        if (errors.confirmPassword) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                confirmPassword: validateConfirmPassword(
                                                    value,
                                                    password
                                                ),
                                            }));
                                        }

                                        if (errors.form) {
                                            setErrors((prev) => ({ ...prev, form: undefined }));
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const err = validateConfirmPassword(
                                            e.target.value,
                                            password
                                        );
                                        setErrors((prev) => ({
                                            ...prev,
                                            confirmPassword: err,
                                        }));
                                    }}
                                    aria-invalid={!!errors.confirmPassword}
                                    aria-describedby="confirm-password-error"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="flex items-center justify-center w-5 h-5"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            {/* Animated confirm password error */}
                            <p
                                id="confirm-password-error"
                                className={cn(
                                    "text-xs text-red-500 px-1 overflow-hidden transition-all duration-300 ease-out transform",
                                    errors.confirmPassword
                                        ? "max-h-10 opacity-100 translate-y-0 mt-1"
                                        : "max-h-0 opacity-0 -translate-y-2 mt-0"
                                )}
                            >
                                {errors.confirmPassword ?? " "}
                            </p>
                        </div>
                    )}

                    {/* Forgot password link – only on signin */}
                    {variant === "signin" && (
                        <div className="flex justify-end">
                            <a
                                href="/forgot-password"
                                className="text-xs font-medium hover:text-foreground/60"
                            >
                                Forgot password?
                            </a>
                        </div>
                    )}

                    {/* Primary button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "w-full mt-1 rounded-xl bg-foreground text-background py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2",
                            "hover:bg-foreground/80",
                            isSubmitting &&
                            "opacity-70 cursor-not-allowed hover:bg-foreground"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>
                                    {variant === "forgotpassword"
                                        ? "Sending..."
                                        : variant === "resetpassword"
                                            ? "Resetting..."
                                            : variant === "register"
                                                ? "Creating account..."
                                                : "Signing in..."}
                                </span>
                            </>
                        ) : (
                            <>
                                {variant === "forgotpassword"
                                    ? "Send Email"
                                    : variant === "resetpassword"
                                        ? "Reset password"
                                        : variant === "register"
                                            ? "Get Started"
                                            : "Get Started"}
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 pt-2">
                        <span className="h-px flex-1 bg-foreground" />
                        <span className="text-[10px] uppercase tracking-[0.18em] text-foreground">
                            {variant === "register"
                                ? "Already have an account?"
                                : variant === "signin"
                                    ? "Don't have an account?"
                                    : "..."}
                        </span>
                        <span className="h-px flex-1 bg-foreground" />
                    </div>

                    {/* Bottom link */}
                    <div className="text-[10px] text-center">
                        <a
                            href={bottomLinkHref}
                            className="text-xs font-medium text-foreground/60 hover:text-foreground/90"
                        >
                            {bottomLinkLabel}
                        </a>
                    </div>
                </div>
            </form>
        </div>
    );
}