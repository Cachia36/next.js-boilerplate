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

describe("currentRepo", () => {
  it("uses memoryUserRepository when PERSISTENCE_DRIVER is not 'mongo'", async () => {
    setTestEnv({
      NODE_ENV: "test",
      JWT_SECRET: "secret",
      PERSISTENCE_DRIVER: "memory",
    });

    const memoryModule = await import("./userRepository.memory");
    const mongoModule = await import("./userRepository.mongo");
    const { repo } = await import("./currentRepo");

    // identity check
    expect(repo).toBe(memoryModule.memoryUserRepository);
    expect(repo).not.toBe(mongoModule.mongoUserRepository);
  });

  it("uses mongoUserRepository when PERSISTENCE_DRIVER is 'mongo'", async () => {
    setTestEnv({
      NODE_ENV: "test",
      JWT_SECRET: "secret",
      PERSISTENCE_DRIVER: "mongo",
      MONGODB_URI: "mongodb://localhost:27017",
      MONGODB_DB_NAME: "testdb",
    });

    const memoryModule = await import("./userRepository.memory");
    const mongoModule = await import("./userRepository.mongo");
    const { repo } = await import("./currentRepo");

    expect(repo).toBe(mongoModule.mongoUserRepository);
    expect(repo).not.toBe(memoryModule.memoryUserRepository);
  });
});
