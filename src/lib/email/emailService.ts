import type { EmailProvider } from "./emailProvider";
import { consoleEmailProvider } from "./providers/consoleEmailProvider";
import { resendEmailProvider } from "./providers/resendEmailProvider";
import { NODE_ENV, RESEND_API_KEY } from "../env";

let provider: EmailProvider;

if (RESEND_API_KEY) {
  provider = resendEmailProvider;
} else {
  provider = consoleEmailProvider;
}

// You can still override this in tests if needed
export function setEmailProvider(p: EmailProvider) {
  provider = p;
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  // Always use the configured provider
  await provider.sendPasswordReset(to, resetLink);

  // Optional: also log to console in non-production for easier debugging
  if (NODE_ENV !== "production") {
    await consoleEmailProvider.sendPasswordReset(to, resetLink);
  }
}
