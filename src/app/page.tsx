import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Auth Boilerplate",
  description:
    "A production-leaning authentication boilerplate built with Next.js, TypeScript, JWT, and Tailwind CSS.",
};

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <section className="space-y-6">
        <p className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase">
          Portfolio Project · Authentication Boilerplate
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Next.js Authentication Boilerplate
        </h1>

        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
          A production-leaning starter kit that showcases how I design and implement authentication,
          API routes, testing, and modern frontend architecture with Next.js, TypeScript, and
          Tailwind CSS.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/dashboard"
            className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm transition hover:opacity-90"
          >
            Open Demo Dashboard
          </Link>

          <Link
            href="/about"
            className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
          >
            Read About the Architecture
          </Link>

          {/* Replace href with your actual GitHub repo */}
          <a
            href="https://github.com/your-username/your-repo"
            target="_blank"
            rel="noreferrer"
            className="border-border text-muted-foreground hover:bg-muted inline-flex items-center justify-center rounded-md border border-dashed px-4 py-2 text-sm font-medium"
          >
            View Source on GitHub
          </a>
        </div>
      </section>

      {/* Key value props */}
      <section className="mt-16 grid gap-8 md:grid-cols-3">
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-base font-semibold">Real-world Auth</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Email + password login, JWT access and refresh tokens, HttpOnly cookies, protected
            routes, and password reset flow wired end to end.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-base font-semibold">Clean Architecture</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Separation between UI, services, domain logic, and infrastructure: repositories, email
            providers, rate limiting, and env handling.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-base font-semibold">Tested & CI Ready</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Vitest unit tests for core modules and a GitHub Actions workflow that runs the test
            suite on every push and pull request.
          </p>
        </div>
      </section>

      {/* Tech stack */}
      <section className="mt-16 space-y-4">
        <h2 className="text-2xl font-semibold">Tech Stack</h2>
        <p className="text-muted-foreground text-sm">
          Built with a modern, production-oriented stack:
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            "Next.js (App Router)",
            "TypeScript",
            "Tailwind CSS",
            "JWT (access + refresh)",
            "Zod",
            "Vitest",
            "ESLint (flat config)",
            "Prettier",
          ].map((item) => (
            <span
              key={item}
              className="bg-muted text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Architecture preview */}
      <section className="mt-16 space-y-4">
        <h2 className="text-2xl font-semibold">Architecture at a Glance</h2>
        <p className="text-muted-foreground text-sm">
          The project is structured to be easy to extend into a real product:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-card text-muted-foreground rounded-xl border p-5 text-sm">
            <h3 className="text-foreground mb-2 text-sm font-semibold">Auth & Domain</h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                <code className="bg-muted rounded px-1 py-0.5 text-[11px]">src/lib/auth</code> –
                auth service, JWT handling, password hashing
              </li>
              <li>
                <code className="bg-muted rounded px-1 py-0.5 text-[11px]">UserRepository</code>{" "}
                abstraction with in-memory implementation
              </li>
              <li>Password reset tokens + pluggable email provider</li>
            </ul>
          </div>

          <div className="bg-card text-muted-foreground rounded-xl border p-5 text-sm">
            <h3 className="text-foreground mb-2 text-sm font-semibold">API & Middleware</h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>REST-style route handlers under `/api/auth/*`</li>
              <li>Shared error handler and rate limiter for consistent responses</li>
              <li>Middleware-protected routes for `/dashboard` and auth-only pages</li>
            </ul>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          For a deeper, more technical breakdown of the architecture, visit the{" "}
          <Link
            href="/about"
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            About page
          </Link>
          .
        </p>
      </section>

      {/* How to explore */}
      <section className="mt-16 mb-8 space-y-4">
        <h2 className="text-2xl font-semibold">How to Explore This Demo</h2>

        <ol className="text-muted-foreground list-decimal space-y-2 pl-5 text-sm">
          <li>
            Register a new account using the{" "}
            <Link
              href="/register"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              registration page
            </Link>
            .
          </li>
          <li>Log in and navigate to the dashboard to see a protected page.</li>
          <li>Try logging out and visiting the dashboard again to test the middleware.</li>
          <li>
            Optionally, trigger the forgot/reset password flow and inspect the console output for
            the email provider.
          </li>
        </ol>
      </section>
    </main>
  );
}
