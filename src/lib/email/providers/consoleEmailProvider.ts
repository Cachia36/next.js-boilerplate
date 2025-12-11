import type { EmailProvider } from "../emailProvider";
import { logInfo } from "@/lib/logger";

//No email is sent, instead it is logged, for testing
export const consoleEmailProvider: EmailProvider = {
  async sendPasswordReset(to, resetLink) {
    logInfo("Sending password reset email (console provider)", {
      to,
      resetLink,
    });
  },
};
