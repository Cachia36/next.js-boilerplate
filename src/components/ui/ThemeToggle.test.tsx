import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("sets aria-pressed based on isDark", () => {
    const { rerender } = render(<ThemeToggle isDark={false} onToggle={() => {}} />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button.getAttribute("aria-pressed")).toBe("false");

    rerender(<ThemeToggle isDark={true} onToggle={() => {}} />);
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();

    render(<ThemeToggle isDark={false} onToggle={onToggle} />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
