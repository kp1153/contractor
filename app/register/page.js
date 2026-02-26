// app/register/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      router.push("/login");
    }
  }

  const inputClass = "block w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-black text-black text-lg">C</div>
          <span className="font-black text-2xl tracking-tight">ContractorDesk</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-2xl font-black mb-2">Create account</h1>
          <p className="text-zinc-500 text-sm mb-6">Start managing your sites today</p>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-zinc-400 text-sm mb-1.5">Full Name</label>
            <input type="text" placeholder="Your name" value={name}
              onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="mb-4">
            <label className="block text-zinc-400 text-sm mb-1.5">Email</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="mb-6">
            <label className="block text-zinc-400 text-sm mb-1.5">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} placeholder="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass + " pr-12"} />
              <span onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-zinc-300 text-sm font-medium">
                {show ? "Hide" : "Show"}
              </span>
            </div>
          </div>
          <button onClick={handleSubmit}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-black font-black rounded-lg transition-colors text-sm uppercase tracking-wide">
            Create Account
          </button>
          <p className="text-center text-zinc-500 text-sm mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}