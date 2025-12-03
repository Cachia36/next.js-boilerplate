"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
    isDark: boolean;
    onToggle: () => void;
};

function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const checked = mounted ? isDark : false;

    return (
        <button
            type="button"
            onClick={onToggle}
            role="switch"
            aria-checked={checked}
            className="flex items-center gap-2 focus:outline-none"
        >
            <span
                className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors border",
                    isDark
                        ? "bg-foreground border-foreground"
                        : "bg-foreground border-foreground"
                )}
            >
                <span
                    className={cn(
                        "inline-block h-5 w-5 rounded-full bg-background shadow transition-transform transform-gpu",
                        // Only move the thumb after we’re mounted to avoid SSR/client mismatch
                        mounted && isDark ? "translate-x-5" : "translate-x-1"
                    )}
                />
            </span>
        </button>
    );
}


export default function Navbar() {
    const { toggleTheme, effectiveTheme } = useTheme();
    const isDark = effectiveTheme === "dark";
    const [isOpen, setIsOpen] = useState(false);

    const { user, logout, loading } = useAuth();
    const isLoggedIn = !!user;

    const router = useRouter();

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/", label: "About Us" },
        { href: "/", label: "Services" },
        { href: "/", label: "Contact" },
    ];

    const closeMenu = () => setIsOpen(false);

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

    return (
        <nav className="sticky top-0 z-50 w-full border-b px-4 py-4 bg-background">
            {/* MOBILE: top row */}
            <div className="flex items-center justify-between md:hidden">
                <div className="text-lg font-bold">Boilerplate</div>
                <div className="flex flex-row gap-4">
                    <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="p-2 rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground"
                        aria-label="Toggle navigation menu"
                        aria-expanded={isOpen}
                    >
                        <div className="relative h-5 w-5">
                            <span
                                className={cn(
                                    "absolute left-0 h-[2px] w-5 bg-foreground transition-transform duration-200 ease-out",
                                    isOpen ? "translate-y-[6px] rotate-45" : "translate-y-[0px]"
                                )}
                            />
                            <span
                                className={cn(
                                    "absolute left-0 h-[2px] w-5 bg-foreground transition-all duration-200 ease-out",
                                    isOpen ? "opacity-0" : "opacity-100 translate-y-[6px]"
                                )}
                            />
                            <span
                                className={cn(
                                    "absolute left-0 h-[2px] w-5 bg-foreground transition-transform duration-200 ease-out",
                                    isOpen ? "translate-y-[6px] -rotate-45" : "translate-y-[12px]"
                                )}
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            <div
                className={cn(
                    "fixed inset-0 md:hidden z-40 transition-[opacity,visibility] duration-300",
                    isOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
                )}
            >
                <div className="absolute inset-0 bg-black/40" onClick={closeMenu} />

                <div
                    className={cn(
                        "absolute left-0 top-0 h-full w-3/4 max-w-xs bg-background border-r shadow-lg transform transition-transform duration-300 ease-out",
                        isOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mt-6 flex flex-col items-center gap-6 px-4">
                        <div className="flex gap-4">
                            {!loading && !isLoggedIn && (
                                <>
                                    <Link
                                        href="/register"
                                        onClick={closeMenu}
                                        className="mt-2 px-6 py-2 text-sm"
                                    >
                                        Sign Up
                                    </Link>

                                    <Link
                                        href="/login"
                                        onClick={closeMenu}
                                        className="mt-2 px-6 py-2 text-sm border rounded-full bg-foreground text-background"
                                    >
                                        Login
                                    </Link>
                                </>
                            )}

                            {!loading && isLoggedIn && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        logout();
                                        closeMenu();
                                        router.push("/login");
                                    }}
                                    className="mt-2 px-6 py-2 text-sm border rounded-full bg-foreground text-background"
                                >
                                    Logout
                                </button>
                            )}
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
            <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center font-semibold text-lg">Logo</div>

                <div className="flex gap-8 text-sm font-medium">
                    {navLinks.map((link) => (
                        <Link
                            key={`${link.href}-${link.label}`}
                            href={link.href}
                            className="relative text-sm font-medium after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

                    {!loading && !isLoggedIn && (
                        <>
                            <Link href="/register" className="px-4 py-2 text-sm">
                                Sign Up
                            </Link>

                            <Link
                                href="/login"
                                className="border rounded-full bg-foreground text-background px-4 py-2 text-sm"
                            >
                                Log in
                            </Link>
                        </>
                    )}

                    {!loading && isLoggedIn && (
                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                router.push("/login");
                            }}
                            className="border rounded-full bg-foreground text-background px-4 py-2 text-sm"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}