// app/dashboard/DashboardClient.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardClient({ sites, userId }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleAddSite(e) {
    e.preventDefault();
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, client_name: clientName, user_id: userId }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      router.refresh();
      setName("");
      setClientName("");
      setShowForm(false);
    }
  }

  const totalInvoiced = sites.reduce((sum, s) => sum + s.total_invoiced, 0);
  const totalExpense = sites.reduce((sum, s) => sum + s.total_expense, 0);
  const totalProfit = totalInvoiced - totalExpense;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-black text-black text-sm">C</div>
          <span className="font-bold text-lg tracking-tight">ContractorDesk</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/workers")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-medium transition-colors">
            Workers
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded-lg text-sm font-bold transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total Invoiced</p>
            <p className="text-2xl font-black text-orange-400">₹{totalInvoiced.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total Expense</p>
            <p className="text-2xl font-black text-red-400">₹{totalExpense.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Net Profit</p>
            <p className={`text-2xl font-black ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              ₹{totalProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Sites Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sites ({sites.length})</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded-lg text-sm font-bold transition-colors">
            + New Site
          </button>
        </div>

        {/* Add Site Form */}
        {showForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="font-bold mb-4 text-zinc-300">Add New Site</h3>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <input type="text" placeholder="Site Name" value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full mb-3 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500" />
            <input type="text" placeholder="Client Name" value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="block w-full mb-4 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500" />
            <div className="flex gap-3">
              <button onClick={handleAddSite}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded-lg font-bold transition-colors">
                Add Site
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Sites List */}
        {sites.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <p className="text-4xl mb-3">🏗️</p>
            <p className="font-medium">No sites yet. Add your first site.</p>
          </div>
        )}

        <div className="grid gap-3">
          {sites.map((site) => (
            <div key={site.id} onClick={() => router.push(`/sites/${site.id}`)}
              className="bg-zinc-900 border border-zinc-800 hover:border-orange-500 rounded-xl p-5 cursor-pointer transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{site.name}</h3>
                  <p className="text-zinc-500 text-sm">Client: {site.client_name || "N/A"}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  site.status === "active" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
                }`}>
                  {site.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
                <div>
                  <p className="text-zinc-600 text-xs uppercase tracking-wide mb-1">Invoiced</p>
                  <p className="font-bold text-orange-400">₹{site.total_invoiced.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs uppercase tracking-wide mb-1">Expense</p>
                  <p className="font-bold text-red-400">₹{site.total_expense.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs uppercase tracking-wide mb-1">Profit</p>
                  <p className={`font-bold ${site.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ₹{site.profit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}