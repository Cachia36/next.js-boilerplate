import { cookies } from "next/headers";
import { authService } from "@/lib/auth/authService";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // In normal flow, middleware should have blocked access without a token.
  // So if we *still* don't have one, just show a fallback instead of redirecting.
  if (!accessToken) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-4 text-red-500">No access token found. Please log in again.</p>
      </main>
    );
  }

  let user: any = null;
  try {
    user = await authService.getUserFromAccessToken(accessToken);
  } catch (error) {
    // Token invalid/expired or user missing – don't redirect here to avoid loops.
    // Just show a nice fallback. You can add a "Go to login" link if you like.
    console.error("Dashboard getUserFromAccessToken error:", error);

    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-4 text-red-500">
          Your session seems to be invalid or expired. Please log in again.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-4">Protected page. You must be logged in to see this.</p>

      <pre className="mt-4 rounded bg-slate-900 p-4 text-sm text-slate-100">
        {JSON.stringify(
          {
            userId: user.id,
            email: user.email,
            role: user.role,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}
