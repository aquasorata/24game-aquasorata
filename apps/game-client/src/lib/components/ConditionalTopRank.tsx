"use client";

import { usePathname } from "next/navigation";
import { TopRankPanel } from "@/lib/components/TopRankPanel";

export function ConditionalTopRank() {
  const pathname = usePathname();

  const allowedPaths = ["/",];

  const shouldShow = allowedPaths.includes(pathname);

  if (!shouldShow) return null;

  return <TopRankPanel />;
}