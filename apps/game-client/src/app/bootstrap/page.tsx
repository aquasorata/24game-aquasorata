'use client';

import { useState } from "react";
import { bootstrapUser } from "@/lib/api/bootstrap";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onBootstrap() {
    try {
      const result = await bootstrapUser({username, password});

      if (!result.ok) {
        setMsg(`${result.message}`);
        return;
      }
      
      setMsg(`User created successfully`);
    } catch {
      setMsg('Network error or server crashed.');
    }
  }

  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-3">
        <div className="text-xl font-semibold">Bootstrap User</div>

        <input className="w-full rounded-xl border px-3 py-2"
          value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        <input className="w-full rounded-xl border px-3 py-2"
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />

        <button className="w-full rounded-xl border py-3" onClick={onBootstrap}>
          Create User
        </button>

        {msg && <div className="text-sm opacity-80">{msg}</div>}
      </div>
    </main>
  );
}