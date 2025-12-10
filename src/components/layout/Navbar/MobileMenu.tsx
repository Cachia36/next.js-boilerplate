"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthActions } from "@/components/auth/AuthActions";
import type { NavLink } from "./NavLinks";

type MobileMenuProps = {
  isOpen: boolean;
  navLinks: NavLink[];
  authLoading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentPath: string;
};

export function MobileMenu({
  isOpen,
  navLinks,
  authLoading,
  isLoggedIn,
  isAdmin,
  onClose,
  onLogout,
  currentPath,
}: MobileMenuProps) {
  // Avoid using document on the server
  if (typeof document === "undefined") {
    return null;
  }

  const portalTarget = document.body;

  const isRouteActive = (href: string) => {
    if (href.startsWith("#")) return false;
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-70 transition-[opacity,visibility] duration-300 md:hidden",
        isOpen
          ? "pointer-events-auto visible opacity-100"
          : "pointer-events-none invisible opacity-0",
      )}
    >
      {/* Backdrop – covers entire viewport, clicking closes menu */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Floating panel */}
      <div
        className={cn(
          "border-border bg-background/95 absolute inset-x-0 top-3 mx-4 origin-top rounded-2xl border shadow-xl",
          "transition-all duration-300 ease-out",
          isOpen ? "translate-y-0 scale-100 opacity-100" : "-translate-y-4 scale-95 opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / brand */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
              Auth Boilerplate
            </span>
            <span className="text-muted-foreground/80 text-[11px]">Next.js · TypeScript · JWT</span>
          </div>

          <span className="text-muted-foreground/70 text-[11px]">Menu</span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 px-4 pt-1 pb-4">
          {/* Auth actions */}
          <div className="flex justify-center">
            <AuthActions
              loading={authLoading}
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              onLinkClick={onClose}
              onLogout={() => {
                onClose();
                onLogout();
              }}
            />
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-2 text-base font-medium">
            {navLinks.map((link) => {
              const active = isRouteActive(link.href);

              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between rounded-full px-3 py-2 text-sm transition-colors",
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                    active && "bg-muted text-foreground",
                  )}
                >
                  <span>{link.label}</span>
                  {active && <span className="bg-foreground h-1.5 w-1.5 rounded-full" />}
                </Link>
              );
            })}
          </nav>

          {/* Small footer hint */}
          <div className="border-border/70 mt-1 border-t pt-3">
            <p className="text-muted-foreground/80 text-[11px]">
              Tap anywhere outside this panel to close the menu.
            </p>
          </div>
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
