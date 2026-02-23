import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
  const clientRes = await db.execute({ sql: "SELECT * FROM clients WHERE id=?", args: [id] });
  if (!clientRes.rows.length) notFound();
  const c = clientRes.rows[0];
  const projects = await db.execute({ sql: "SELECT * FROM projects WHERE client_id=? ORDER BY id DESC", args: [id] });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{c.name}</h1>
      <p className="text-gray-500 mb-6">{c.mobile} | {c.address} | GST: {c.gst || "—"}</p>
      <h2 className="text-lg font-semibold mb-3">Projects</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-orange-50">
            <tr>{["Title", "Type", "Contract Value", "Status", ""].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {projects.rows.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 capitalize">{p.type}</td>
                <td className="p-3">₹{p.contract_value}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{p.status}</span></td>
                <td className="p-3"><Link href={`/projects/${p.id}`} className="text-orange-600 text-sm hover:underline">View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}