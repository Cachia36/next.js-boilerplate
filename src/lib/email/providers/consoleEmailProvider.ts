import type { EmailProvider } from "../emailProvider";
import { logInfo } from "@/lib/logger";

export const consoleEmailProvider: EmailProvider = {
  async sendPasswordReset(to, resetLink) {
    logInfo("Sending password reset email (console provider)", {
      to,
      resetLink,
    });
  },
};
