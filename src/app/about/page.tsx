import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Next.js Auth Boilerplate",
  description:
    "Deep dive into the architecture, authentication flow, security, and testing strategy of this Next.js auth boilerplate.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-5xl px-6 py-16">
      {/* Intro */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Architecture & Design</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          This page provides a technical overview of how the boilerplate is structured under the
          hood: architecture, authentication flow, security measures, testing setup, and the
          trade-offs made to keep it focused and easy to extend.
        </p>
      </section>

      {/* Architecture */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-semibold">High-Level Architecture</h2>

        <p className="text-muted-foreground leading-relaxed">
          The project is organised using a layered approach to keep concerns well-separated and the
          codebase easy to maintain:
        </p>

        <ul className="text-muted-foreground list-disc space-y-2 pl-6">
          <li>
            <strong>UI Layer</strong> – pages, layouts, and presentational components in{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">src/app</code> and{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">src/components</code>
          </li>
          <li>
            <strong>Application Layer</strong> – route handlers and feature-specific services (e.g.
            auth) that orchestrate requests and responses.
          </li>
          <li>
            <strong>Domain Layer</strong> – core auth logic, JWT handling, password hashing, and
            business rules in{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">src/lib/auth</code>.
          </li>
          <li>
            <strong>Infrastructure Layer</strong> – repositories, email provider, environment
            parsing, rate limiter, and logging utilities.
          </li>
        </ul>

        <p className="text-muted-foreground leading-relaxed">
          Authentication logic is centralised in{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">authService</code> and related
          helpers. Data access is abstracted behind a{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">UserRepository</code> interface so
          the current in-memory implementation can be swapped for a database-backed one without
          changing the rest of the codebase.
        </p>
      </section>

      {/* Auth flow */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-semibold">Authentication Flow</h2>

        <p className="text-muted-foreground leading-relaxed">
          Authentication is based on JSON Web Tokens with separate access and refresh tokens. The
          flow looks like this:
        </p>

        <ol className="text-muted-foreground list-decimal space-y-2 pl-6">
          <li>
            User registers with email and password via{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">POST /api/auth/register</code>.
          </li>
          <li>
            Passwords are hashed using{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">bcryptjs</code> and stored via
            the <code className="bg-muted rounded px-1 py-0.5 text-xs">UserRepository</code>.
          </li>
          <li>
            On login, an <strong>access token</strong> (short-lived) and{" "}
            <strong>refresh token</strong> (longer-lived) are issued and stored as HttpOnly cookies.
          </li>
          <li>
            Protected pages (e.g. dashboard) rely on the access token, which is validated
            server-side using the JWT service.
          </li>
          <li>
            A password reset flow issues one-time reset tokens, stores them in the user record, and
            sends reset links via a pluggable email provider abstraction.
          </li>
        </ol>

        <p className="text-muted-foreground leading-relaxed">
          All token creation, verification, and cookie management is handled in the auth service and
          JWT helpers so the API route handlers stay thin and focused on HTTP concerns.
        </p>
      </section>

      {/* Middleware & routing */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-semibold">Routing & Middleware</h2>

        <p className="text-muted-foreground leading-relaxed">
          The project uses the Next.js App Router with route handlers under{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">src/app/api</code>.
          Authentication-aware behaviour is implemented via{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">src/middleware.ts</code>:
        </p>

        <ul className="text-muted-foreground list-disc space-y-2 pl-6">
          <li>
            Authenticated users are redirected away from auth pages (
            <code className="bg-muted rounded px-1 py-0.5 text-xs">/login</code>,{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">/register</code> etc.) to the
            dashboard.
          </li>
          <li>
            Unauthenticated users attempting to access protected routes (e.g.{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">/dashboard</code>) are redirected
            to <code className="bg-muted rounded px-1 py-0.5 text-xs">/login</code>.
          </li>
          <li>
            Middleware can read tokens from both cookies and the{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">Authorization</code> header,
            making it easier to extend into API clients later.
          </li>
        </ul>
      </section>

      {/* Security */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-semibold">Security Considerations</h2>

        <ul className="text-muted-foreground list-disc space-y-2 pl-6">
          <li>
            JWT secrets and other critical values are validated at startup using{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">zod</code> in{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">src/lib/env.ts</code>.
          </li>
          <li>
            Access and refresh tokens are stored in HttpOnly cookies, with the{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">secure</code> flag enabled in
            production.
          </li>
          <li>
            A central <code className="bg-muted rounded px-1 py-0.5 text-xs">HttpError</code> type
            and API error handler ensure consistent error responses and logging.
          </li>
          <li>
            A basic in-memory rate limiter is applied to sensitive endpoints like login and password
            reset to reduce brute-force attempts.
          </li>
        </ul>

        <p className="text-muted-foreground leading-relaxed">
          While the in-memory implementations are not intended for horizontal scaling, the
          abstractions are designed so that a Redis-backed rate limiter or database-backed user
          store can be introduced with minimal changes.
        </p>
      </section>

      {/* Testing & CI */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-semibold">Testing & CI</h2>

        <p className="text-muted-foreground leading-relaxed">
          The project uses <strong>Vitest</strong> for unit testing core logic:
        </p>

        <ul className="text-muted-foreground list-disc space-y-2 pl-6">
          <li>Authentication service and JWT helpers</li>
          <li>Password hashing utilities</li>
          <li>Environment variable parsing and validation</li>
          <li>Rate limiter logic</li>
          <li>API route wrapper and error handling</li>
        </ul>

        <p className="text-muted-foreground leading-relaxed">
          A GitHub Actions workflow runs the test suite on every push and pull request using Node
          20, providing fast feedback and ensuring the core behaviour stays correct as the project
          evolves.
        </p>
      </section>

      {/* Limitations & future work */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-semibold">Limitations & Next Steps</h2>

        <p className="text-muted-foreground leading-relaxed">
          A few intentional limitations keep the boilerplate lightweight:
        </p>

        <ul className="text-muted-foreground list-disc space-y-2 pl-6">
          <li>Users are stored in an in-memory repository.</li>
          <li>Rate limiting is in-memory and process-bound.</li>
          <li>
            The email provider currently logs messages to the console instead of sending real
            emails.
          </li>
        </ul>

        <p className="text-muted-foreground leading-relaxed">
          The next logical step would be integrating a real database (e.g. Postgres with Prisma or
          Drizzle), a Redis-backed rate limiter, and an external email provider such as Resend or
          Postmark. The existing abstractions are designed to make those upgrades straightforward.
        </p>
      </section>

      {/* Closing */}
      <section className="mt-20 space-y-4 border-t pt-12">
        <h2 className="text-2xl font-semibold">Goal of This Boilerplate</h2>
        <p className="text-muted-foreground leading-relaxed">
          The goal of this boilerplate is to act as a solid starting point for real-world products
          while also showcasing how I think about clean architecture, security, and developer
          experience in a modern Next.js codebase.
        </p>
      </section>
    </main>
  );
}
