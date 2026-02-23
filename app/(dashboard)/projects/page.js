import { db, initDB } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  await initDB();
  const clients = await db.execute("SELECT * FROM clients ORDER BY name");

  async function addProject(formData) {
    "use server";
    await db.execute({
      sql: "INSERT INTO projects (client_id, title, type, contract_value, status, start_date, end_date) VALUES (?,?,?,?,?,?,?)",
      args: [formData.get("client_id"), formData.get("title"), formData.get("type"), formData.get("contract_value"), "active", formData.get("start_date"), formData.get("end_date")],
    });
    redirect("/projects");
  }

  const { rows } = await db.execute(
    "SELECT p.*, c.name as client_name FROM projects p LEFT JOIN clients c ON p.client_id=c.id ORDER BY p.id DESC"
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <form action={addProject} className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3">
        <select name="client_id" required className="border rounded p-2 flex-1 min-w-36">
          <option value="">Client चुनें*</option>
          {clients.rows.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="title" placeholder="Project Title*" required className="border rounded p-2 flex-1 min-w-40" />
        <select name="type" className="border rounded p-2">
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
          <option value="road">Road / Civil</option>
        </select>
        <input name="contract_value" type="number" placeholder="Contract Value ₹" className="border rounded p-2 w-36" />
        <input name="start_date" type="date" className="border rounded p-2" />
        <input name="end_date" type="date" className="border rounded p-2" />
        <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">+ Add</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-orange-50">
            <tr>{["Title", "Client", "Type", "Contract Value", "Status", ""].map((h) => <th key={h} className="p-3 text-left text-sm font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((p) => (
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