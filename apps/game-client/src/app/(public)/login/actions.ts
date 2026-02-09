// "use server";

export async function LoginAction( formData: FormData ) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || !password) return { ok: false, message: 'Invalid credentials.' };

  const res = await fetch(`${process.env.NEXT_PUBLIC_GAME_SERVER_URL}/auth/login`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  })

  if (!res.ok) return { ok: false, message: 'Invalid credentials.' };

  return { ok: true }
}