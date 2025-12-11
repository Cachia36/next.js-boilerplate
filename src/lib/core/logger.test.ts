import { describe, it, expect, vi, afterEach } from "vitest";

const ORIGINAL_ENV = process.env;

function setTestEnv(env: NodeJS.ProcessEnv) {
  process.env = {
    ...ORIGINAL_ENV,
    ...env,
  };
}

afterEach(() => {
  process.env = ORIGINAL_ENV;
  vi.resetModules();
  vi.clearAllMocks();
});

describe("logger", () => {
  it("does not log anything when NODE_ENV='test'", async () => {
    setTestEnv({
      NODE_ENV: "test",
      JWT_SECRET: "secret",
    });

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const logger = await import("./logger");
    logger.logInfo("hello");
    logger.logWarn("warn");
    logger.logError("error");
    logger.logAuthEvent("login_success", { userId: "123" });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it("logs JSON payloads in development", async () => {
    setTestEnv({
      NODE_ENV: "development",
      JWT_SECRET: "secret",
    });

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { logInfo, logAuthEvent } = await import("./logger");

    logInfo("plain_message", { foo: "bar" });
    logAuthEvent("login_success", { userId: "123" });

    expect(logSpy).toHaveBeenCalled();

    const [firstCallArg] = logSpy.mock.calls[0];
    const parsed = JSON.parse(firstCallArg as string);

    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("plain_message");
    expect(parsed.foo).toBe("bar");
    expect(typeof parsed.timestamp).toBe("string");

    const [secondCallArg] = logSpy.mock.calls[1];
    const parsed2 = JSON.parse(secondCallArg as string);
    expect(parsed2.message).toBe("auth:login_success");
    expect(parsed2.userId).toBe("123");
  });
});
