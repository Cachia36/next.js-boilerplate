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
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Portfolio Project · Authentication Boilerplate
        </p>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Next.js Authentication Boilerplate
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          A production-leaning starter kit that showcases how I design and
          implement authentication, API routes, testing, and modern frontend
          architecture with Next.js, TypeScript, and Tailwind CSS.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Open Demo Dashboard
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Read About the Architecture
          </Link>

          {/* Replace href with your actual GitHub repo */}
          <a
            href="https://github.com/your-username/your-repo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            View Source on GitHub
          </a>
        </div>
      </section>

      {/* Key value props */}
      <section className="mt-16 grid gap-8 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Real-world Auth</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Email + password login, JWT access and refresh tokens, HttpOnly
            cookies, protected routes, and password reset flow wired end to end.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Clean Architecture</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Separation between UI, services, domain logic, and infrastructure:
            repositories, email providers, rate limiting, and env handling.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Tested & CI Ready</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Vitest unit tests for core modules and a GitHub Actions workflow
            that runs the test suite on every push and pull request.
          </p>
        </div>
      </section>

      {/* Tech stack */}
      <section className="mt-16 space-y-4">
        <h2 className="text-2xl font-semibold">Tech Stack</h2>
        <p className="text-sm text-muted-foreground">
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
              className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Architecture preview */}
      <section className="mt-16 space-y-4">
        <h2 className="text-2xl font-semibold">Architecture at a Glance</h2>
        <p className="text-sm text-muted-foreground">
          The project is structured to be easy to extend into a real product:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Auth & Domain
            </h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                  src/lib/auth
                </code>{" "}
                – auth service, JWT handling, password hashing
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                  UserRepository
                </code>{" "}
                abstraction with in-memory implementation
              </li>
              <li>
                Password reset tokens + pluggable email provider
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              API & Middleware
            </h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>REST-style route handlers under `/api/auth/*`</li>
              <li>
                Shared error handler and rate limiter for consistent responses
              </li>
              <li>
                Middleware-protected routes for `/dashboard` and auth-only pages
              </li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          For a deeper, more technical breakdown of the architecture, visit the{" "}
          <Link
            href="/about"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            About page
          </Link>
          .
        </p>
      </section>

      {/* How to explore */}
      <section className="mt-16 mb-8 space-y-4">
        <h2 className="text-2xl font-semibold">How to Explore This Demo</h2>

        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Register a new account using the{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              registration page
            </Link>
            .
          </li>
          <li>Log in and navigate to the dashboard to see a protected page.</li>
          <li>
            Try logging out and visiting the dashboard again to test the
            middleware.
          </li>
          <li>
            Optionally, trigger the forgot/reset password flow and inspect the
            console output for the email provider.
          </li>
        </ol>
      </section>
    </main>
  );
}
