import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { authService } from "@/lib/auth/authService";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frontend Boilerplate",
  description: "Reusable boilerplate for portfolio apps",
};

const themeInitCode = `
  (function() {
    try {
      var STORAGE_KEY = 'app:theme';
      var stored = localStorage.getItem(STORAGE_KEY);
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored || (systemDark ? 'dark' : 'light');

      var root = document.documentElement;
      root.dataset.theme = theme;
    } catch (e) {
      // fail silently
    }
  })();
`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  let user: { id: string; role?: string } | null = null;

  if (accessToken) {
    try {
      user = await authService.getUserFromAccessToken(accessToken);
    } catch {
      // invalid / expired token → treat as logged out
      user = null;
    }
  }

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitCode }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
