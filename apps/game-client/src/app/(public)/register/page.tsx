'use client';

import { useState } from "react";
import { bootstrapUser } from "@/lib/api/bootstrap";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function validatePassword(password: string) {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const passwordRules = validatePassword(password);
  const isPasswordValid =
    passwordRules.length &&
    passwordRules.lowercase &&
    passwordRules.uppercase;


  async function onBootstrap() {
    if (!isPasswordValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    try {
      const result = await bootstrapUser({username, password});

      if (!result.ok) {
        setMsg(`${result.message}`);
        toast.error(`${result.message}`);
        return;
      }
      
      toast.success(`Created successfully`);
      router.push('/login');
    } catch {
      toast.error('Network error or server crashed.');
    }
  }

  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-md w-full border border-[#64afdd] bg-white/95 backdrop-blur-md p-6 space-y-6">
        <div className="text-center text-xl text-[#64afdd] font-semibold uppercase">Create Account</div>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <input 
              className="
                flex-1 border px-3 py-2 transition-colors duration-300 
                border-slate-700 outline-none focus:border-[#64afdd]
                not-placeholder-shown:border-[#64afdd]
              "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              type="text"
              required
            />
            <input 
              className="
                flex-1 border px-3 py-2 transition-colors duration-300
                border-slate-700 outline-none focus:border-[#64afdd]
                not-placeholder-shown:border-[#64afdd]
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="text-sm space-y-1 px-2 font-semibold uppercase">
            <div className={`
              transition-colors duration-300 
              ${passwordRules.length ? "text-[#64afdd]" : "text-[#FF5555]"}
            `}>
              At least 8 characters
            </div>
            <div className={`
              transition-colors duration-300 
              ${passwordRules.lowercase ? "text-[#64afdd]" : "text-[#FF5555]"}
            `}>
              Must include a lowercase letter
            </div>
            <div className={`
              transition-colors duration-300 
              ${passwordRules.uppercase ? "text-[#64afdd]" : "text-[#FF5555]"}
            `}>
              Must include an uppercase letter
            </div>
          </div>
          {msg && <div className="text-[#FF5555] text-xs uppercase">{msg}</div>}
          <button 
            className={`
              block w-full text-center py-3 border
              font-semibold uppercase mt-4
              duration-300 transition-colors
              ${
                isPasswordValid
                  ? 'border-[#64afdd] text-[#64afdd] hover:bg-[#64afdd] hover:text-white'
                  : 'border-slate-700 text-slate-700 hover:bg-slate-700 hover:text-white'
              }
              disabled:cursor-not-allowed
            `}
            disabled={!isPasswordValid}
            onClick={onBootstrap}
          >
            Create
          </button>
      </div>
    </main>
  );
}