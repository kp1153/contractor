import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const projectRes = await db.execute({
    sql: "SELECT p.*, c.name as client_name, c.mobile as client_mobile, c.address as client_address, c.gst as client_gst FROM projects p LEFT JOIN clients c ON p.client_id=c.id WHERE p.id=?",
    args: [id],
  });
  if (!projectRes.rows.length) notFound();
  const p = projectRes.rows[0];

  const [materials, labour, payments] = await Promise.all([
    db.execute({ sql: "SELECT * FROM materials WHERE project_id=? ORDER BY id DESC", args: [id] }),
    db.execute({ sql: "SELECT * FROM labour WHERE project_id=? ORDER BY id DESC", args: [id] }),
    db.execute({ sql: "SELECT * FROM payments WHERE project_id=? ORDER BY id DESC", args: [id] }),
  ]);

  const materialCost = materials.rows.reduce((s, r) => s + (r.qty * r.rate || 0), 0);
  const labourCost = labour.rows.reduce((s, r) => s + (r.days * r.rate_per_day || 0), 0);
  const totalCost = materialCost + labourCost;
  const received = payments.rows.filter(r => r.type === "received").reduce((s, r) => s + r.amount, 0);
  const profit = p.contract_value - totalCost;

  async function addMaterial(formData) {
    "use server";
    await db.execute({
      sql: "INSERT INTO materials (project_id, description, unit, qty, rate, vendor, date) VALUES (?,?,?,?,?,?,?)",
      args: [id, formData.get("description"), formData.get("unit"), formData.get("qty"), formData.get("rate"), formData.get("vendor"), new Date().toISOString().split("T")[0]],
    });
    redirect(`/projects/${id}`);
  }

  async function addLabour(formData) {
    "use server";
    await db.execute({
      sql: "INSERT INTO labour (project_id, worker_name, trade, days, rate_per_day, date) VALUES (?,?,?,?,?,?)",
      args: [id, formData.get("worker_name"), formData.get("trade"), formData.get("days"), formData.get("rate_per_day"), new Date().toISOString().split("T")[0]],
    });
    redirect(`/projects/${id}`);
  }

  async function addPayment(formData) {
    "use server";
    await db.execute({
      sql: "INSERT INTO payments (project_id, amount, type, note, date) VALUES (?,?,?,?,?)",
      args: [id, formData.get("amount"), formData.get("type"), formData.get("note"), new Date().toISOString().split("T")[0]],
    });
    redirect(`/projects/${id}`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{p.title}</h1>
        <p className="text-gray-500">{p.client_name} | {p.client_mobile} | <span className="capitalize">{p.type}</span></p>
        <p className="text-gray-400 text-sm">{p.start_date} → {p.end_date}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Contract Value", value: `₹${p.contract_value}`, color: "bg-orange-100 text-orange-700" },
          { label: "Material Cost", value: `₹${materialCost.toFixed(0)}`, color: "bg-yellow-100 text-yellow-700" },
          { label: "Labour Cost", value: `₹${labourCost.toFixed(0)}`, color: "bg-purple-100 text-purple-700" },
          { label: "Total Cost", value: `₹${totalCost.toFixed(0)}`, color: "bg-red-100 text-red-700" },
          { label: "Amount Received", value: `₹${received.toFixed(0)}`, color: "bg-green-100 text-green-700" },
          { label: "Profit / Loss", value: `₹${profit.toFixed(0)}`, color: profit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700" },
        ].map((c) => (
          <div key={c.label} className={`p-4 rounded-xl ${c.color} shadow`}>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <Link href={`/invoice/${id}`} className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">🧾 GST Invoice</Link>

      <div>
        <h2 className="text-lg font-semibold mb-3">Material</h2>
        <form action={addMaterial} className="bg-white p-3 rounded-xl shadow mb-3 flex flex-wrap gap-2">
          <input name="description" placeholder="Item*" required className="border rounded p-2 flex-1 min-w-36" />
          <input name="unit" placeholder="Unit" className="border rounded p-2 w-20" />
          <input name="qty" type="number" step="0.01" placeholder="Qty" className="border rounded p-2 w-20" />
          <input name="rate" type="number" step="0.01" placeholder="Rate ₹" className="border rounded p-2 w-24" />
          <input name="vendor" placeholder="Vendor" className="border rounded p-2 w-32" />
          <button className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 text-sm">+ Add</button>
        </form>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-yellow-50">
              <tr>{["Date", "Item", "Unit", "Qty", "Rate", "Amount", "Vendor"].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {materials.rows.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3 text-sm">{m.date}</td>
                  <td className="p-3">{m.description}</td>
                  <td className="p-3 text-sm">{m.unit || "—"}</td>
                  <td className="p-3">{m.qty}</td>
                  <td className="p-3">₹{m.rate}</td>
                  <td className="p-3 font-semibold">₹{(m.qty * m.rate).toFixed(0)}</td>
                  <td className="p-3 text-sm">{m.vendor || "—"}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={5} className="p-3 text-right">Total</td>
                <td className="p-3">₹{materialCost.toFixed(0)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Labour</h2>
        <form action={addLabour} className="bg-white p-3 rounded-xl shadow mb-3 flex flex-wrap gap-2">
          <input name="worker_name" placeholder="मजदूर का नाम*" required className="border rounded p-2 flex-1 min-w-36" />
          <input name="trade" placeholder="काम (Mason/Carpenter...)" className="border rounded p-2 w-40" />
          <input name="days" type="number" step="0.5" placeholder="दिन" className="border rounded p-2 w-20" />
          <input name="rate_per_day" type="number" placeholder="रोज ₹" className="border rounded p-2 w-24" />
          <button className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm">+ Add</button>
        </form>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>{["Date", "नाम", "काम", "दिन", "रोज ₹", "कुल"].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {labour.rows.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-3 text-sm">{l.date}</td>
                  <td className="p-3 font-medium">{l.worker_name}</td>
                  <td className="p-3 text-sm">{l.trade || "—"}</td>
                  <td className="p-3">{l.days}</td>
                  <td className="p-3">₹{l.rate_per_day}</td>
                  <td className="p-3 font-semibold">₹{(l.days * l.rate_per_day).toFixed(0)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={5} className="p-3 text-right">Total</td>
                <td className="p-3">₹{labourCost.toFixed(0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Payments</h2>
        <form action={addPayment} className="bg-white p-3 rounded-xl shadow mb-3 flex flex-wrap gap-2">
          <input name="amount" type="number" placeholder="Amount*" required className="border rounded p-2 w-32" />
          <select name="type" className="border rounded p-2">
            <option value="received">Received</option>
            <option value="pending">Pending</option>
          </select>
          <input name="note" placeholder="Note" className="border rounded p-2 flex-1" />
          <button className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm">+ Add</button>
        </form>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-green-50">
              <tr>{["Date", "Amount", "Type", "Note"].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {payments.rows.map((pay) => (
                <tr key={pay.id} className="border-t">
                  <td className="p-3">{pay.date}</td>
                  <td className="p-3 font-bold">₹{pay.amount}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${pay.type === "received" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{pay.type}</span></td>
                  <td className="p-3">{pay.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}