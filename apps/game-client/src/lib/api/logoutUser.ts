export async function logoutUser() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_GAME_SERVER_URL}/auth/logout`, {
    method: 'POST',
    credentials: "include",
    cache: "no-store",
  })

  if (!res.ok) return { ok: false, message: 'Invalid credentials.' };
  console.log('logout')
  return { ok: true };
}