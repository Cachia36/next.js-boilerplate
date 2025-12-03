"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    LogIn,
    Loader2,
    MailCheck,
    UserPlus,
    KeyRound,
    CheckCircle2,
} from "lucide-react";

import {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { EmailField } from "./EmailField";
import { PasswordField } from "./PasswordField";
import {
    loginRequest,
    registerRequest,
    forgotPasswordRequest,
    resetPasswordRequest,
} from "@/lib/auth/authClient";

type AuthVariant = "signin" | "register" | "forgotpassword" | "resetpassword";

type AuthCardProps = {
    variant?: AuthVariant;
    resetToken?: string;
};

type FieldErrors = {
    email?: string;
    password?: string;
    confirmPassword?: string;
};

type VariantCopy = {
    title: string;
    mainText: string;
    dividerText: string;
    bottomLinkHref: string;
    bottomLinkLabel: string;
    idleButtonLabel: string;
    submittingLabel: string;
};

const VARIANT_COPY: Record<AuthVariant, VariantCopy> = {
    signin: {
        title: "Sign in with email",
        mainText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit",
        dividerText: "Don't have an account?",
        bottomLinkHref: "/register",
        bottomLinkLabel: "Click here to register",
        idleButtonLabel: "Get Started",
        submittingLabel: "Signing in...",
    },
    register: {
        title: "Create an account",
        mainText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit",
        dividerText: "Already have an account?",
        bottomLinkHref: "/login",
        bottomLinkLabel: "Click here to log in",
        idleButtonLabel: "Get Started",
        submittingLabel: "Creating account...",
    },
    forgotpassword: {
        title: "Forgot password",
        mainText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit",
        dividerText: "...",
        bottomLinkHref: "/login",
        bottomLinkLabel: "Return to login",
        idleButtonLabel: "Send Email",
        submittingLabel: "Sending...",
    },
    resetpassword: {
        title: "Reset password",
        mainText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit",
        dividerText: "...",
        bottomLinkHref: "/login",
        bottomLinkLabel: "Return to login",
        idleButtonLabel: "Reset password",
        submittingLabel: "Resetting...",
    },
};

// --- Header config helper ----------------------------------------------------

type HeaderConfig = {
    Icon: typeof LogIn;
    wrapperClass: string;
    title: string;
    text: string;
};

function getHeaderConfig(
    variant: AuthVariant,
    copy: VariantCopy,
    options: {
        showResetSuccess: boolean;
        showForgotSuccess: boolean;
    }
): HeaderConfig {
    const { showResetSuccess, showForgotSuccess } = options;

    // 1. Reset-password success state
    if (showResetSuccess) {
        return {
            Icon: CheckCircle2,
            wrapperClass: "bg-emerald-500/15 text-emerald-500",
            title: "Success!",
            text: "Redirecting to login",
        };
    }

    // 2. Forgot-password success (email sent)
    if (variant === "forgotpassword" && showForgotSuccess) {
        return {
            Icon: MailCheck,
            wrapperClass: "bg-emerald-500/15 text-emerald-500",
            title: "Email sent",
            text: "If an account exists for this email, we've sent a password reset link.",
        };
    }

    // 3. Default per-variant header
    switch (variant) {
        case "signin":
            return {
                Icon: LogIn,
                wrapperClass: "bg-foreground/15",
                title: copy.title,
                text: copy.mainText,
            };
        case "register":
            return {
                Icon: UserPlus,
                wrapperClass: "bg-foreground/15",
                title: copy.title,
                text: copy.mainText,
            };
        case "forgotpassword":
            return {
                Icon: KeyRound,
                wrapperClass: "bg-foreground/15",
                title: copy.title,
                text: copy.mainText,
            };
        case "resetpassword":
            return {
                Icon: KeyRound,
                wrapperClass: "bg-foreground/15",
                title: copy.title,
                text: copy.mainText,
            };
        default:
            return {
                Icon: LogIn,
                wrapperClass: "bg-foreground/15",
                title: copy.title,
                text: copy.mainText,
            };
    }
}

// --- Component ---------------------------------------------------------------

export default function AuthCard({
    variant = "signin",
    resetToken,
}: AuthCardProps) {
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

    const [isResetSuccess, setIsResetSuccess] = useState(false);
    const [hasSentResetEmail, setHasSentResetEmail] = useState(false);

    const copy = VARIANT_COPY[variant];

    const showResetSuccess = variant === "resetpassword" && isResetSuccess;
    const showForgotSuccess = variant === "forgotpassword" && hasSentResetEmail;

    const { Icon: HeaderIcon, wrapperClass, title, text } = getHeaderConfig(
        variant,
        copy,
        { showResetSuccess, showForgotSuccess }
    );

    const clearFormMessage = () => setFormMessage(null);

    // --- Variant-specific submit handlers -------------------------------------

    const handleSignIn = async () => {
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

    const handleRegister = async () => {
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

    const handleForgotPassword = async () => {
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

    const handleResetPassword = async () => {
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

    // Map variant -> handler (avoids switch)
    const submitHandlers: Record<AuthVariant, () => Promise<void>> = {
        signin: handleSignIn,
        register: handleRegister,
        forgotpassword: handleForgotPassword,
        resetpassword: handleResetPassword,
    };

    // --- Root submit handler ---------------------------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || showResetSuccess) return;

        await submitHandlers[variant]();
    };

    // --- JSX -------------------------------------------------------------------

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
                        wrapperClass
                    )}
                >
                    <HeaderIcon className="w-5 h-5" />
                </div>

                <h2 className="mt-4 text-lg font-semibold">{title}</h2>

                <p className="mt-1 text-xs text-center px-10 text-foreground/80">
                    {text}
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="px-6 pb-6 pt-2 space-y-4"
                noValidate
            >
                <div className="space-y-3">
                    {/* Form-level message (errors only) */}
                    {formMessage && (
                        <p className="text-xs text-red-500 px-1 text-center">
                            {formMessage}
                        </p>
                    )}

                    {/* Email – shown on all except resetpassword */}
                    {variant !== "resetpassword" && (
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

                                if (variant === "forgotpassword" && hasSentResetEmail) {
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
                    )}

                    {/* Password – hidden on forgotpassword, shown on others */}
                    {variant !== "forgotpassword" && (
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
                    )}

                    {/* Confirm password field */}
                    {(variant === "resetpassword" || variant === "register") && (
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
                    )}

                    {/* Forgot password link – only on signin */}
                    {variant === "signin" && (
                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-xs font-medium hover:text-foreground/60"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    )}

                    {/* Primary button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || showResetSuccess}
                        className={cn(
                            "w-full mt-1 rounded-3xl bg-foreground text-background py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2",
                            "hover:bg-foreground/80",
                            (isSubmitting || showResetSuccess) &&
                            "opacity-70 cursor-not-allowed hover:bg-foreground"
                        )}
                    >
                        {isSubmitting || showResetSuccess ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>
                                    {showResetSuccess ? "Redirecting..." : copy.submittingLabel}
                                </span>
                            </>
                        ) : (
                            <>{copy.idleButtonLabel}</>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 pt-2">
                        <span className="h-px flex-1 bg-foreground" />
                        <span className="text-[10px] uppercase tracking-[0.18em] text-foreground">
                            {copy.dividerText}
                        </span>
                        <span className="h-px flex-1 bg-foreground" />
                    </div>

                    {/* Bottom link */}
                    <div className="text-[10px] text-center">
                        <Link
                            href={copy.bottomLinkHref}
                            className="text-xs font-medium text-foreground/60 hover:text-foreground/90"
                        >
                            {copy.bottomLinkLabel}
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}