// app/workers/WorkersClient.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkersClient({ workers, userId }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

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
      setName("");
      setPhone("");
      setDailyRate("");
      setShowForm(false);
    }
  }

  const inputClass = "block w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 mb-3";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-black text-black text-sm">C</div>
          <span className="font-bold text-lg tracking-tight">ContractorDesk</span>
        </div>
        <button onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-medium transition-colors">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">Workers ({workers.length})</h1>
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
            <input type="number" placeholder="Daily Rate (₹)" value={dailyRate}
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
              <div className="text-right">
                <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Daily Rate</p>
                <p className="font-black text-orange-400 text-xl">₹{w.daily_rate.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}