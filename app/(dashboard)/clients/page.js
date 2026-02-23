import { db, initDB } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ClientsPage() {
  await initDB();

  async function addClient(formData) {
    "use server";
    await db.execute({
      sql: "INSERT INTO clients (name, mobile, email, address, gst) VALUES (?,?,?,?,?)",
      args: [formData.get("name"), formData.get("mobile"), formData.get("email"), formData.get("address"), formData.get("gst")],
    });
    redirect("/clients");
  }

  const { rows } = await db.execute("SELECT * FROM clients ORDER BY id DESC");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <form action={addClient} className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3">
        <input name="name" placeholder="नाम*" required className="border rounded p-2 flex-1 min-w-32" />
        <input name="mobile" placeholder="मोबाइल" className="border rounded p-2 w-36" />
        <input name="email" placeholder="Email" className="border rounded p-2 flex-1 min-w-36" />
        <input name="address" placeholder="पता" className="border rounded p-2 flex-1 min-w-40" />
        <input name="gst" placeholder="GST No." className="border rounded p-2 w-40" />
        <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">+ Add</button>
      </form>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-orange-50">
            <tr>{["Name", "Mobile", "Address", "GST", ""].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.mobile || "—"}</td>
                <td className="p-3">{c.address || "—"}</td>
                <td className="p-3">{c.gst || "—"}</td>
                <td className="p-3"><Link href={`/clients/${c.id}`} className="text-orange-600 text-sm hover:underline">View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}