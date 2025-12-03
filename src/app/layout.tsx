import { AuthProvider } from "@/hooks/useAuth";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

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
      var theme = stored || 'system';
      var effective = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

      var root = document.documentElement;
      root.dataset.theme = effective;

      if (effective === 'dark') {
        root.style.setProperty('--background', '#0a0a0a');
        root.style.setProperty('--foreground', '#e5e5e5');
      } else {
        root.style.setProperty('--background', '#fafafa');
        root.style.setProperty('--foreground', '#1a1a1a');
      }
    } catch (e) {
      // fail silently
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitCode }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Fills all space between navbar and footer */}
            <main className="flex-1 flex flex-col">
              {children}
            </main>

            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}