import 'server-only';

import { cookies } from "next/headers";
import type { Me } from "@/app/providers/auth-provider";

export async function getMeServer(): Promise<Me|null> {
  const cookieStore  = cookies();
  const sid = (await cookieStore).get("sid")?.value;

  if (!sid) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_GAME_SERVER_URL}/auth/me`, {
    headers: { cookie: `sid=${sid}` },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return null;

  return (await res.json()) as Me;
}