"use client";

import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";
import { AuthActions } from "@/components/auth/AuthActions";
import type { NavLink } from "./NavLinks";

type DesktopNavbarProps = {
  navLinks: NavLink[];
  isDark: boolean;
  toggleTheme: () => void;
  authLoading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
};

export function DesktopNavbar({
  navLinks,
  isDark,
  toggleTheme,
  authLoading,
  isLoggedIn,
  isAdmin,
  onLogout,
}: DesktopNavbarProps) {
  return (
    <div className="hidden items-center justify-between md:flex">
      <div className="flex items-center text-lg font-semibold">Logo</div>

      <div className="flex gap-8 text-sm font-medium">
        {navLinks.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="after:bg-foreground relative text-sm font-medium after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:transition-all after:duration-300 hover:after:w-full"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        <AuthActions
          loading={authLoading}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}
