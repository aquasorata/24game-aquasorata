export async function logoutUser() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: "include",
    cache: "no-store",
  })

  if (!res.ok) return { ok: false, message: 'Invalid credentials.' };
  
  return { ok: true };
}