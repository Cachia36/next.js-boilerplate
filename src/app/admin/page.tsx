import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/lib/auth/authService";
import type { User } from "@/types/user";

export default async function AdminDashboardPage() {
  // In server components, cookies() is synchronous
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // No token at all – send them to login
  if (!accessToken) {
    redirect("/login");
  }

  let user: User;

  try {
    // getUserFromAccessToken will throw if token is invalid/expired
    user = (await authService.getUserFromAccessToken(accessToken)) as User;
  } catch (error) {
    console.error("Admin getUserFromAccessToken error:", error);
    redirect("/login");
  }

  // ADMIN-ONLY ENFORCEMENT
  if (user.role !== "admin") {
    // Logged in but not an admin → send to normal dashboard
    redirect("/dashboard");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Admin Area</h1>
      <p className="mt-4">
        This is an example of an admin-only route using role-based access control on top of
        authentication.
      </p>

      <pre className="mt-4 rounded bg-slate-900 p-4 text-sm wrap-break-word whitespace-pre-wrap text-slate-100">
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
