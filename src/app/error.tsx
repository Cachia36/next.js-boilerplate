"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // TODO: plug in Sentry / LogRocket / your own logger here
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        An unexpected error occurred. You can try again or go back to the home page.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition"
        >
          Try again
        </button>

        <a
          href="/"
          className="rounded-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Go home
        </a>
      </div>
    </main>
  );
}