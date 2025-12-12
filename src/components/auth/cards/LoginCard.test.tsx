import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginCard } from "./LoginCard";

// Mock next/navigation router (LoginCard still calls useRouter, even if it doesn't use push)
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock next/link so it doesn't explode under test
vi.mock("next/link", () => ({
  __esModule: true,
  default: (props: any) => <a {...props} />,
}));

// Mock authClient loginRequest
const loginRequestMock = vi.fn();
vi.mock("@/lib/auth/client/authClient", () => ({
  loginRequest: (...args: any[]) => loginRequestMock(...args),
}));

describe("LoginCard", () => {
  beforeEach(() => {
    loginRequestMock.mockReset();
    // Reset location between tests
    window.location.href = "http://localhost/";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors when fields are empty on submit", async () => {
    render(<LoginCard />);

    const submitButton = screen.getByText("Sign in");

    fireEvent.click(submitButton);

    // Email and password validation come from Zod via validateEmail/validatePassword
    expect(await screen.findByText("Email is required")).toBeTruthy();
    expect(await screen.findByText("Password must be at least 8 characters")).toBeTruthy();

    expect(loginRequestMock).not.toHaveBeenCalled();
  });

  it("calls loginRequest and redirects on successful login", async () => {
    loginRequestMock.mockResolvedValue({
      user: { id: "1", email: "test@example.com" },
      accessToken: "token",
      refreshToken: "refresh",
    });

    // Start from /login so we can see the redirect effect clearly
    window.location.href = "http://localhost/login";

    render(<LoginCard />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByText("Sign in");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password1" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(loginRequestMock).toHaveBeenCalledWith("test@example.com", "Password1");
    });

    await waitFor(() => {
      // LoginCard does: window.location.href = "/"
      expect(window.location.pathname).toBe("/");
    });
  });

  it("shows a friendly message when loginRequest throws a 429 error", async () => {
    const err: any = new Error("Too many");
    err.statusCode = 429;
    loginRequestMock.mockRejectedValue(err);

    render(<LoginCard />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByText("Sign in");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password1" } });

    fireEvent.click(submitButton);

    expect(await screen.findByText("Too many attempts. Please wait and try again.")).toBeTruthy();
  });
});
