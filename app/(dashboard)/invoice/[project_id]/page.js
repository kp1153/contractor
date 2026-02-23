import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function InvoicePage({ params }) {
  const { project_id } = await params;
  const projectRes = await db.execute({
    sql: "SELECT p.*, c.name as client_name, c.address as client_address, c.mobile as client_mobile, c.gst as client_gst FROM projects p LEFT JOIN clients c ON p.client_id=c.id WHERE p.id=?",
    args: [project_id],
  });
  if (!projectRes.rows.length) notFound();
  const p = projectRes.rows[0];

  const [materials, labour, payments] = await Promise.all([
    db.execute({ sql: "SELECT * FROM materials WHERE project_id=?", args: [project_id] }),
    db.execute({ sql: "SELECT * FROM labour WHERE project_id=?", args: [project_id] }),
    db.execute({ sql: "SELECT SUM(amount) as total FROM payments WHERE project_id=? AND type='received'", args: [project_id] }),
  ]);

  const materialCost = materials.rows.reduce((s, r) => s + (r.qty * r.rate || 0), 0);
  const labourCost = labour.rows.reduce((s, r) => s + (r.days * r.rate_per_day || 0), 0);
  const subtotal = p.contract_value;
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;
  const received = payments.rows[0].total || 0;
  const due = grandTotal - received;
  const invoiceNo = `INV-${project_id}-${new Date().getFullYear()}`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-2xl font-bold">GST Invoice</h1>
        <button onClick={() => window.print()} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">🖨️ Print</button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between mb-6 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-orange-700">TAX INVOICE</h2>
            <p className="text-sm text-gray-500">Invoice No: {invoiceNo}</p>
            <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString("en-IN")}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">Contractor Pro</p>
            <p className="text-sm text-gray-500">GST: XXXXXXXXXXXXXXX</p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-1">BILL TO</p>
            <p className="font-bold">{p.client_name}</p>
            <p className="text-sm text-gray-500">{p.client_mobile}</p>
            <p className="text-sm text-gray-500">{p.client_address}</p>
            {p.client_gst && <p className="text-sm text-gray-500">GST: {p.client_gst}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-1">PROJECT</p>
            <p className="font-bold">{p.title}</p>
            <p className="text-sm text-gray-500 capitalize">{p.type}</p>
          </div>
        </div>

        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-orange-50">
              {["#", "Description", "SAC", "Amount"].map((h) => <th key={h} className="border p-2 text-left text-sm">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">1</td>
              <td className="border p-2">Construction Work — {p.title}</td>
              <td className="border p-2 text-sm">995414</td>
              <td className="border p-2 font-semibold">₹{subtotal}</td>
            </tr>
            <tr className="text-sm text-gray-500">
              <td className="border p-2"></td>
              <td className="border p-2 pl-6">↳ Material Cost</td>
              <td className="border p-2"></td>
              <td className="border p-2">₹{materialCost.toFixed(0)}</td>
            </tr>
            <tr className="text-sm text-gray-500">
              <td className="border p-2"></td>
              <td className="border p-2 pl-6">↳ Labour Cost</td>
              <td className="border p-2"></td>
              <td className="border p-2">₹{labourCost.toFixed(0)}</td>
            </tr>
            <tr><td colSpan={3} className="border p-2 text-right font-semibold">Subtotal</td><td className="border p-2">₹{subtotal}</td></tr>
            <tr><td colSpan={3} className="border p-2 text-right font-semibold">CGST 9%</td><td className="border p-2">₹{(gst / 2).toFixed(0)}</td></tr>
            <tr><td colSpan={3} className="border p-2 text-right font-semibold">SGST 9%</td><td className="border p-2">₹{(gst / 2).toFixed(0)}</td></tr>
            <tr className="bg-orange-50"><td colSpan={3} className="border p-2 text-right font-bold text-lg">Grand Total</td><td className="border p-2 font-bold text-lg">₹{grandTotal.toFixed(0)}</td></tr>
            <tr><td colSpan={3} className="border p-2 text-right text-green-600 font-semibold">Amount Received</td><td className="border p-2 text-green-600 font-semibold">₹{received}</td></tr>
            <tr className="bg-red-50"><td colSpan={3} className="border p-2 text-right font-bold text-red-600">Balance Due</td><td className="border p-2 font-bold text-red-600">₹{due.toFixed(0)}</td></tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-400">SAC Code 995414 — Construction Services</p>
      </div>
    </div>
  );
}