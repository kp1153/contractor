import { isLoggedIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function DashboardLayout({ children }) {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) redirect("/");

  async function logout() {
    "use server";
    const c = await cookies();
    c.delete("session");
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-orange-900 text-white flex flex-col p-4 gap-1">
        <h2 className="text-lg font-bold mb-4 text-center">🏗️ Contractor Pro</h2>
        {[
          { href: "/dashboard", label: "📊 Dashboard" },
          { href: "/clients", label: "👤 Clients" },
          { href: "/projects", label: "📁 Projects" },
          { href: "/labour", label: "👷 Labour" },
          { href: "/payments", label: "💰 Payments" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="py-2 px-3 rounded hover:bg-orange-700 transition text-sm">
            {item.label}
          </Link>
        ))}
        <form action={logout} className="mt-auto">
          <button className="w-full py-2 px-3 bg-red-600 rounded hover:bg-red-700 text-sm">🚪 Logout</button>
        </form>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}