"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { getCurrentUser, logoutRequest } from "@/lib/auth/authClient";
import { ThemeToggle } from "../ThemeToggle";
import { NAV_LINKS } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { DesktopNavbar } from "./DesktopNavbar";

export default function Navbar() {
  const { toggleTheme, effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  // Check auth + role on mount & route change
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const data = await getCurrentUser();

        if (!cancelled) {
          const user = data.user;
          setIsLoggedIn(!!user);
          setIsAdmin(user?.role === "admin");
        }
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      // ignore errors – we still treat user as logged out
    } finally {
      setIsLoggedIn(false);
      setIsAdmin(false);
      router.push("/login");
    }
  };

  return (
    <nav className="bg-background sticky top-0 z-50 w-full border-b px-4 py-4">
      {/* MOBILE: top row */}
      <div className="flex items-center justify-between md:hidden">
        <div className="text-lg font-bold">Boilerplate</div>
        <div className="flex flex-row gap-4">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="focus-visible:ring-foreground rounded-md border p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            <div className="relative h-5 w-5">
              <span
                className={cn(
                  "bg-foreground absolute left-0 h-0.5 w-5 transition-transform duration-200 ease-out",
                  isOpen ? "translate-y-1.5 rotate-45" : "translate-y-0",
                )}
              />
              <span
                className={cn(
                  "bg-foreground absolute left-0 h-0.5 w-5 transition-all duration-200 ease-out",
                  isOpen ? "opacity-0" : "translate-y-1.5 opacity-100",
                )}
              />
              <span
                className={cn(
                  "bg-foreground absolute left-0 h-0.5 w-5 transition-transform duration-200 ease-out",
                  isOpen ? "translate-y-1.5 -rotate-45" : "translate-y-3",
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <MobileMenu
        isOpen={isOpen}
        navLinks={NAV_LINKS}
        authLoading={authLoading}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onClose={closeMenu}
        onLogout={handleLogout}
      />

      {/* DESKTOP */}
      <DesktopNavbar
        navLinks={NAV_LINKS}
        isDark={isDark}
        toggleTheme={toggleTheme}
        authLoading={authLoading}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
    </nav>
  );
}
