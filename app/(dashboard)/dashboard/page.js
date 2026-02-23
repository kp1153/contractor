import { db, initDB } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  await initDB();
  const [clients, projects, received, pending, materials, labour] = await Promise.all([
    db.execute("SELECT COUNT(*) as count FROM clients"),
    db.execute("SELECT COUNT(*) as count FROM projects WHERE status='active'"),
    db.execute("SELECT SUM(amount) as total FROM payments WHERE type='received'"),
    db.execute("SELECT SUM(amount) as total FROM payments WHERE type='pending'"),
    db.execute("SELECT SUM(qty*rate) as total FROM materials"),
    db.execute("SELECT SUM(days*rate_per_day) as total FROM labour"),
  ]);

  const cards = [
    { label: "Total Clients", value: clients.rows[0].count, color: "bg-blue-100 text-blue-700", href: "/clients" },
    { label: "Active Projects", value: projects.rows[0].count, color: "bg-orange-100 text-orange-700", href: "/projects" },
    { label: "Amount Received", value: `₹${received.rows[0].total || 0}`, color: "bg-green-100 text-green-700", href: "/payments" },
    { label: "Amount Pending", value: `₹${pending.rows[0].total || 0}`, color: "bg-red-100 text-red-700", href: "/payments" },
    { label: "Total Material Cost", value: `₹${Math.round(materials.rows[0].total || 0)}`, color: "bg-yellow-100 text-yellow-700", href: "/projects" },
    { label: "Total Labour Cost", value: `₹${Math.round(labour.rows[0].total || 0)}`, color: "bg-purple-100 text-purple-700", href: "/labour" },
  ];

  const recentProjects = await db.execute(
    "SELECT p.*, c.name as client_name FROM projects p LEFT JOIN clients c ON p.client_id=c.id ORDER BY p.id DESC LIMIT 5"
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`p-5 rounded-xl ${c.color} shadow hover:opacity-90`}>
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm mt-1">{c.label}</div>
          </Link>
        ))}
      </div>
      <h2 className="text-lg font-semibold mb-3">Recent Projects</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-orange-50">
            <tr>{["Project", "Client", "Type", "Contract Value", "Status", ""].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {recentProjects.rows.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{p.client_name}</td>
                <td className="p-3 capitalize">{p.type}</td>
                <td className="p-3">₹{p.contract_value}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${p.status === "active" ? "bg-green-100 text-green-700" : p.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span></td>
                <td className="p-3"><Link href={`/projects/${p.id}`} className="text-orange-600 text-sm hover:underline">View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}