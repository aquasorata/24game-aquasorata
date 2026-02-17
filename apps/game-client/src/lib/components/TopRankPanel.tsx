'use client';

import { useEffect, useState } from "react";
import { getTopRank, RankData } from "../api/getTopRank";

export function TopRankPanel() {
  const [toprank, setToprank] = useState<RankData | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getTopRank();
      setToprank(data);
    }

    load();
  }, []);

  if (!toprank) return <></>;

  return (
    <div
      className="
        w-110 laptop-l:w-80 mobile-l:w-90 
        tablet:w-md mobile-m:w-78 mobile-s:w-64
        mx-auto
        laptop-l:absolute laptop-l:left-6 laptop-l:top-1/2
        laptop-l:-translate-y-1/2
      "
    >
      <div
        className="
          p-5
          bg-white/50 backdrop-blur-md 
          border border-[#64afdd]
          shadow-lg
        "
      >
        <h2 className="text-xl font-bold text-[#64afdd] mb-4">
          TOP RANK
        </h2>
        <div className="mb-6">
          <h3 className="text-sm text-slate-700 uppercase mb-2">
            Highest ELO
          </h3>
          <div className="bg-white p-4 shadow">
            <div className="font-semibold text-slate-700">{toprank.topElo?.username ?? "No players yet"}</div>
            <div className={`text-[#64afdd] font-bold ${toprank.topElo?.username ? "text-[#64afdd]":"text-slate-700"}`}>
              {toprank.topElo?.elo ?? '-'} ELO
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm text-slate-700 uppercase mb-2">
            Fastest Solo Time
          </h3>
          <div className="bg-white p-4 shadow">
            <div className="font-semibold text-slate-700">{toprank.fastestSolo?.username ?? "No record yet"}</div>
            <div className={`text-[#64dd78] font-bold ${toprank.fastestSolo?.username ? "text-[#64dd78]":"text-slate-700"}`}>
              {toprank.fastestSolo?.timeMs
                ? `${(toprank.fastestSolo.timeMs / 1000).toFixed(2)}s`
                : "--:--"
              }
            </div>
          </div>
        </div>
        <div 
          className="mt-4"
        >
          <p
            className="text-sm text-center text-[#64afdd] font-semibold"
          >
            Log in to save your score
          </p>
        </div>
      </div>
    </div>
  );
}
