import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthActions } from "./AuthActions";

// Mock next/link → simple <a>
vi.mock("next/link", () => ({
  __esModule: true,
  default: (props: any) => <a {...props} />,
}));

describe("AuthActions", () => {
  it("renders Sign Up and Log in when not logged in", () => {
    render(<AuthActions loading={false} isLoggedIn={false} onLogout={() => {}} />);

    expect(screen.getByText("Sign Up")).toBeTruthy();
    expect(screen.getByText("Log in")).toBeTruthy();
  });

  it("renders View Account and Sign out when logged in (non-admin)", () => {
    render(<AuthActions loading={false} isLoggedIn={true} onLogout={() => {}} />);

    expect(screen.queryByText("Sign Up")).toBeNull();
    expect(screen.queryByText("Log in")).toBeNull();

    expect(screen.getByText("View Account")).toBeTruthy();
    expect(screen.getByText("Sign out")).toBeTruthy();
    expect(screen.queryByText("Admin")).toBeNull();
  });

  it("renders Admin button when isAdmin is true", () => {
    render(<AuthActions loading={false} isLoggedIn={true} isAdmin={true} onLogout={() => {}} />);

    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("calls onLogout (and then onLinkClick) when Sign out is clicked", () => {
    const calls: string[] = [];
    const onLogout = vi.fn(() => calls.push("logout"));
    const onLinkClick = vi.fn(() => calls.push("link"));

    render(
      <AuthActions
        loading={false}
        isLoggedIn={true}
        onLogout={onLogout}
        onLinkClick={onLinkClick}
      />,
    );

    const signOutButton = screen.getByText("Sign out");
    fireEvent.click(signOutButton);

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(onLinkClick).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(["logout", "link"]);
  });
});
