"use client";

import { useRouter } from "next/navigation";
import { LoginAction } from "./actions";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(formData: FormData) {
    const result = await LoginAction(formData);

    if (!result.ok) {
      toast.error(result.message || 'Login failed.');
      return;
    }

    toast.success('Login successful!');

    router.push('/play');
  }
  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-md w-full border border-[#64afdd] bg-white/95 backdrop-blur-md p-6 space-y-6">
        <div className="text-center text-xl text-[#64afdd] font-semibold uppercase">Login</div>
        <form action={handleLogin} className="flex flex-col gap-3 max-w-sm mx-auto">
          <input
            type="text" 
            name="username" 
            placeholder="Username" required 
            className="
              flex-1 border px-3 py-2 transition-colors duration-300 
              border-slate-700 outline-none focus:border-[#64afdd]
              not-placeholder-shown:border-[#64afdd]
            "
          />
          <input
            type="password" 
            name="password" 
            placeholder="Password" required 
            className="
              flex-1 border px-3 py-2 transition-colors duration-300 
              border-slate-700 outline-none focus:border-[#64afdd]
              not-placeholder-shown:border-[#64afdd]
            "
          />
          <button 
            type="submit" 
            className="
              block w-full text-center py-3 border border-[#64afdd] 
              text-[#64afdd] font-semibold uppercase mt-4
              duration-300 transition-colors
              hover:bg-[#64afdd] hover:text-white
            "
          >
            Login
          </button>
          <Link
            className="
              block w-full text-center
              text-slate-700 font-semibold uppercase
              duration-300 transition-colors
              hover:text-[#64afdd]
            "
            href="/register"
          >
            Create account
          </Link>
        </form>
      </div>
    </main>
  )
}