'use client';

import type { Me } from "@/app/providers/auth-provider";

export async function getMeClient(): Promise<Me | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_GAME_SERVER_URL}/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return null;

  return (await res.json()) as Me;
}