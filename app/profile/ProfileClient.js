"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ProfileClient({ user }) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function handleSave(e) {
    e.preventDefault();
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.success) setMsg("सेव हो गया ✓");
    else setMsg("Error: " + data.error);
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
                if (item.id === "workers") router.push("/workers");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                item.id === "profile"
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
          <h1 className="font-bold text-lg">Profile</h1>
        </div>

        <div className="flex-1 px-6 py-8 max-w-lg w-full mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="font-bold text-zinc-300 mb-6 text-xl">Account Settings</h2>
            {msg && <p className="text-green-400 text-sm mb-4">{msg}</p>}
            <input type="text" placeholder="Name" value={name}
              onChange={(e) => setName(e.target.value)} className={inputClass} />
            <input type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            <input type="password" placeholder="New Password (खाली छोड़ो अगर न बदलना हो)" value={password}
              onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            <button onClick={handleSave}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded-lg font-bold transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}