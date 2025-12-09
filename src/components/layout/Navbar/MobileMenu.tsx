"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthActions } from "@/components/auth/AuthActions";
import { NavLink } from "./NavLinks";

type MobileMenuProps = {
  isOpen: boolean;
  navLinks: NavLink[];
  authLoading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export function MobileMenu({
  isOpen,
  navLinks,
  authLoading,
  isLoggedIn,
  isAdmin,
  onClose,
  onLogout,
}: MobileMenuProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 transition-[opacity,visibility] duration-300 md:hidden",
        isOpen
          ? "pointer-events-auto visible opacity-100"
          : "pointer-events-none invisible opacity-0",
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
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
              onLinkClick={onClose}
              onLogout={() => {
                onClose();
                onLogout();
              }}
            />
          </div>

          <nav className="flex flex-col items-center gap-4 text-lg font-medium">
            {navLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                onClick={onClose}
                className="hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
