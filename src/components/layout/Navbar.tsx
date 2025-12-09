"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { getCurrentUser, logoutRequest } from "@/lib/auth/authClient";
import { AuthActions } from "../auth/AuthActions";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { toggleTheme, effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";
  const [isOpen, setIsOpen] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ];

  const closeMenu = () => setIsOpen(false);

  //Check auth + role on mount & route change
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
      <div
        className={cn(
          "fixed inset-0 z-40 transition-[opacity,visibility] duration-300 md:hidden",
          isOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0",
        )}
      >
        <div className="absolute inset-0 bg-black/40" onClick={closeMenu} />

        <div
          className={cn(
            "bg-background absolute top-0 left-0 h-full w-3/4 max-w-xs transform border-r shadow-lg transition-transform duration-300 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mt-6 flex flex-col items-center gap-6 px-4">
            <div className="flex gap-4">
              <AuthActions
                loading={authLoading}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                onLinkClick={closeMenu}
                onLogout={() => {
                  closeMenu();
                  handleLogout();
                }}
              />
            </div>

            <nav className="flex flex-col items-center gap-4 text-lg font-medium">
              {navLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  onClick={closeMenu}
                  className="hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
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
            onLogout={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
}
