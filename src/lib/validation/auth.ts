export const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required";
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(trimmed)) return "Please enter a valid email address";

    return undefined;
};

export const validatePassword = (value: string): string | undefined => {
    const trimmed = value.trim();

    if (!trimmed) return "Password is required";
    if (trimmed.length < 8) return "Password must be at least 8 characters";

    if (!/[A-Z]/.test(trimmed))
        return "Password must contain at least one capital letter";

    if (!/[0-9]/.test(trimmed))
        return "Password must contain at least one number";

    return undefined;
};

export const validateConfirmPassword = (
    value: string,
    password: string
): string | undefined => {
    const trimmed = value.trim();
    const trimmedPassword = password.trim();

    if (!trimmed) return "Please confirm your password";
    if (trimmed !== trimmedPassword) return "Passwords do not match";

    return undefined;
};