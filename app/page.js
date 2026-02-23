"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ password: e.target.password.value }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) router.push("/dashboard");
    else setError(true);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg w-80">
        <h1 className="text-2xl font-bold text-center mb-2 text-orange-700">🏗️ Contractor Pro</h1>
        <p className="text-center text-gray-400 text-sm mb-6">Labour. Material. Billing.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input type={show ? "text" : "password"} name="password" placeholder="पासवर्ड डालें" className="w-full border rounded-lg p-3 text-lg pr-12" required />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-gray-400 text-xl">
              {show ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">गलत पासवर्ड</p>}
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-orange-700">लॉगिन करें</button>
        </form>
      </div>
    </div>
  );
}