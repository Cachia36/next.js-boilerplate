import { emailSchema, passwordSchema } from "./authSchemas";

export const validateEmail = (value: string): string | undefined => {
  const result = emailSchema.safeParse(value.trim());
  if (!result.success) {
    return result.error.issues[0]?.message ?? "Invalid email";
  }
  return undefined;
};

export const validatePassword = (value: string): string | undefined => {
  const result = passwordSchema.safeParse(value.trim());
  if (!result.success) {
    return result.error.issues[0]?.message ?? "Invalid password";
  }
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