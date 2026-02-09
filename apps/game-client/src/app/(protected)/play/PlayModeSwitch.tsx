'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import SoloPage from "../../../lib/components/SoloPage";
import DuelPage from "../../../lib/components/DuelPage";

type Mode = 'solo' | 'duel';

export default function PlayModeSwitch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = useMemo<Mode | null>(() => {
    const m = searchParams.get('mode');
    if (m === "solo" || m === "duel") return m;
    return null;
  }, [searchParams]);

  useEffect(() => {
    if (!mode) {
      router.replace("/");
    }
  }, [mode, router]);

  if (!mode) return null;

  return (
    <div className="space-y-4">
      {mode === "solo" ? <SoloPage /> : <DuelPage />}
    </div>
  );
}