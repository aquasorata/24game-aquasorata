'use client';

export type RankData = {
  topElo: {
    username: string;
    elo: number;
  } | null;
  fastestSolo: {
    username: string;
    timeMs: number;
  } | null;
};

export async function getTopRank() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rank/top`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error("Failed to fetch rank data");
  }

  return (await res.json()) as RankData;
}