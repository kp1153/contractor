import { db, initDB } from "@/lib/db";
import Link from "next/link";

export default async function PaymentsPage() {
  await initDB();
  const { rows } = await db.execute(
    "SELECT pay.*, p.title as project_title, c.name as client_name FROM payments pay LEFT JOIN projects p ON pay.project_id=p.id LEFT JOIN clients c ON p.client_id=c.id ORDER BY pay.id DESC"
  );
  const received = rows.filter(r => r.type === "received").reduce((s, r) => s + r.amount, 0);
  const pending = rows.filter(r => r.type === "pending").reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payments</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 text-green-700 p-5 rounded-xl shadow">
          <div className="text-3xl font-bold">₹{received}</div>
          <div className="text-sm mt-1">Total Received</div>
        </div>
        <div className="bg-red-100 text-red-700 p-5 rounded-xl shadow">
          <div className="text-3xl font-bold">₹{pending}</div>
          <div className="text-sm mt-1">Total Pending</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-orange-50">
            <tr>{["Date", "Client", "Project", "Amount", "Type", "Note"].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.date}</td>
                <td className="p-3">{r.client_name}</td>
                <td className="p-3"><Link href={`/projects/${r.project_id}`} className="text-orange-600 hover:underline">{r.project_title}</Link></td>
                <td className="p-3 font-bold">₹{r.amount}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${r.type === "received" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{r.type}</span></td>
                <td className="p-3">{r.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}