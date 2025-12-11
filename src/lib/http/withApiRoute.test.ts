import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock handleApiError BEFORE importing withApiRoute
vi.mock("./apiErrorHandler", () => ({
  handleApiError: vi.fn(),
}));

import { withApiRoute } from "./withApiRoute";
import { handleApiError } from "./apiErrorHandler";

const mockHandleApiError = handleApiError as unknown as ReturnType<typeof vi.fn>;

describe("withApiRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the handler and returns its response on success", async () => {
    const handler = vi.fn(async (_req: Request) => {
      return new Response("ok", { status: 200 });
    });

    const wrapped = withApiRoute(handler);

    const req = new Request("http://localhost/test");
    const res = await wrapped(req);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(req);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");

    expect(mockHandleApiError).not.toHaveBeenCalled();
  });

  it("catches errors from handler and delegates to handleApiError", async () => {
    const error = new Error("Boom");

    const handler = vi.fn(async (_req: Request) => {
      throw error;
    });

    const errorResponse = new Response("error", { status: 500 });
    mockHandleApiError.mockReturnValueOnce(errorResponse);

    const wrapped = withApiRoute(handler);

    const req = new Request("http://localhost/test");
    const res = await wrapped(req);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(mockHandleApiError).toHaveBeenCalledTimes(1);
    expect(mockHandleApiError).toHaveBeenCalledWith(error);

    expect(res).toBe(errorResponse);
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("error");
  });
});
