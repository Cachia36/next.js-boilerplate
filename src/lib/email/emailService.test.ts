import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { EmailProvider } from "./emailProvider";
import { sendPasswordResetEmail, setEmailProvider } from "./emailService";
import * as consoleProviderModule from "./providers/consoleEmailProvider";

describe("emailService", () => {
  const consoleSpy = vi.spyOn(consoleProviderModule.consoleEmailProvider, "sendPasswordReset");

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("uses the configured provider via setEmailProvider", async () => {
    const providerMock: EmailProvider = {
      sendPasswordReset: vi.fn().mockResolvedValue(undefined),
    };

    setEmailProvider(providerMock);

    await sendPasswordResetEmail("test@example.com", "https://example.com/reset");

    expect(providerMock.sendPasswordReset).toHaveBeenCalledTimes(1);
    expect(providerMock.sendPasswordReset).toHaveBeenCalledWith(
      "test@example.com",
      "https://example.com/reset",
    );
  });

  it("also logs to consoleEmailProvider in non-production environments", async () => {
    const providerMock: EmailProvider = {
      sendPasswordReset: vi.fn().mockResolvedValue(undefined),
    };

    setEmailProvider(providerMock);

    await sendPasswordResetEmail("test@example.com", "https://example.com/reset");

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("test@example.com", "https://example.com/reset");
  });
});
