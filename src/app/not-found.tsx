import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight mb-2">404 – Page not found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        href="/"
        className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition"
      >
        Go back home
      </Link>
    </main>
  );
}