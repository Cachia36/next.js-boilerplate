import type { EmailProvider } from "./emailProvider";
import { consoleEmailProvider } from "./providers/consoleEmailProvider";
// later: import { resendEmailProvider } from "./providers/resendEmailProvider";
import { NODE_ENV } from "../env";

let provider: EmailProvider = consoleEmailProvider;

// In tests or prod you can swap this
export function setEmailProvider(p: EmailProvider) {
  provider = p;
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  if (NODE_ENV !== "production") {
    // In dev we still log even if we later use a real provider
    await consoleEmailProvider.sendPasswordReset(to, resetLink);
    return;
  }

  await provider.sendPasswordReset(to, resetLink);
}
