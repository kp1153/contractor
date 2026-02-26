"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function WorkersClient({ workers, userId }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function handleAddWorker(e) {
    e.preventDefault();
    const res = await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, daily_rate: dailyRate, user_id: userId }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      router.refresh();
      setName(""); setPhone(""); setDailyRate(""); setShowForm(false);
    }
  }

  async function deleteWorker(id) {
    if (!confirm("Delete this worker?")) return;
    await fetch(`/api/workers/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const inputClass = "block w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 mb-3";

  const menuItems = [
    { id: "sites", label: "Sites", icon: "🏗️" },
    { id: "workers", label: "Workers", icon: "👷" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-56" : "w-14"} bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-200 min-h-screen`}>
        <div className="flex items-center gap-2 px-4 py-5 border-b border-zinc-800">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-black text-black text-sm flex-shrink-0">C</div>
          {sidebarOpen && <span className="font-black text-sm tracking-tight">ContractorDesk</span>}
        </div>

        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <button key={item.id}
              onClick={() => {
                if (item.id === "sites") router.push("/dashboard");
                if (item.id === "profile") router.push("/profile");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                item.id === "workers"
                  ? "bg-orange-500/10 text-orange-400 border-r-2 border-orange-500"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}>
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <span className="text-lg flex-shrink-0">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-400 hover:text-zinc-100 transition-colors text-xl">
            ☰
          </button>
          <h1 className="font-bold text-lg">Workers</h1>
        </div>

        <div className="flex-1 px-6 py-8 max-w-3xl w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">Workers ({workers.length})</h2>
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded-lg text-sm font-bold transition-colors">
              + Add Worker
            </button>
          </div>

          {showForm && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <h2 className="font-bold text-zinc-300 mb-4">New Worker</h2>
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <input type="text" placeholder="Name" value={name}
                onChange={(e) => setName(e.target.value)} className={inputClass} />
              <input type="text" placeholder="Phone" value={phone}
                onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Daily Rate" value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)} className={inputClass} />
              <div className="flex gap-3">
                <button onClick={handleAddWorker}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded-lg font-bold transition-colors">
                  Add Worker
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {workers.length === 0 && (
            <div className="text-center py-16 text-zinc-600">
              <p className="text-4xl mb-3">👷</p>
              <p className="font-medium">No workers yet. Add your first worker.</p>
            </div>
          )}

          <div className="grid gap-3">
            {workers.map((w) => (
              <div key={w.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{w.name}</p>
                  <p className="text-zinc-500 text-sm">{w.phone || "No phone"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Daily Rate</p>
                    <p className="font-black text-orange-400 text-xl">&#8377;{w.daily_rate.toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteWorker(w.id)}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg text-xs font-bold transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}