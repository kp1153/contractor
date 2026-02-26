// app/login/page.js
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
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
          <h1 className="text-2xl font-black mb-2">Welcome back</h1>
          <p className="text-zinc-500 text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-zinc-400 text-sm mb-1.5">Email</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>

          <div className="mb-6">
            <label className="block text-zinc-400 text-sm mb-1.5">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass + " pr-12"} />
              <span onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-zinc-300 text-lg">
                {show ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <button onClick={handleSubmit}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-black font-black rounded-lg transition-colors text-sm uppercase tracking-wide">
            Sign In
          </button>

          <p className="text-center text-zinc-500 text-sm mt-6">
            No account?{" "}
            <a href="/register" className="text-orange-400 hover:text-orange-300 font-medium">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}