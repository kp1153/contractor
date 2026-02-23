import { db, initDB } from "@/lib/db";
import Link from "next/link";

export default async function LabourPage() {
  await initDB();
  const { rows } = await db.execute(
    "SELECT l.*, p.title as project_title FROM labour l LEFT JOIN projects p ON l.project_id=p.id ORDER BY l.id DESC"
  );

  const total = rows.reduce((s, r) => s + (r.days * r.rate_per_day || 0), 0);

  const workerSummary = {};
  rows.forEach((r) => {
    if (!workerSummary[r.worker_name]) workerSummary[r.worker_name] = { days: 0, total: 0, trade: r.trade };
    workerSummary[r.worker_name].days += r.days;
    workerSummary[r.worker_name].total += r.days * r.rate_per_day;
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Labour Register</h1>

      <div className="bg-purple-100 text-purple-700 p-5 rounded-xl shadow inline-block">
        <div className="text-3xl font-bold">₹{total.toFixed(0)}</div>
        <div className="text-sm mt-1">Total Labour Cost</div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Worker-wise Summary</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>{["Worker", "Trade", "Total Days", "Total Paid"].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {Object.entries(workerSummary).map(([name, data]) => (
                <tr key={name} className="border-t">
                  <td className="p-3 font-medium">{name}</td>
                  <td className="p-3">{data.trade || "—"}</td>
                  <td className="p-3">{data.days}</td>
                  <td className="p-3 font-bold">₹{data.total.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">All Entries</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>{["Date", "Worker", "Trade", "Project", "Days", "Rate", "Amount"].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-3 text-sm">{l.date}</td>
                  <td className="p-3 font-medium">{l.worker_name}</td>
                  <td className="p-3 text-sm">{l.trade || "—"}</td>
                  <td className="p-3"><Link href={`/projects/${l.project_id}`} className="text-orange-600 hover:underline text-sm">{l.project_title}</Link></td>
                  <td className="p-3">{l.days}</td>
                  <td className="p-3">₹{l.rate_per_day}</td>
                  <td className="p-3 font-semibold">₹{(l.days * l.rate_per_day).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}