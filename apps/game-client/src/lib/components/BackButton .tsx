'use client';

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        flex items-center py-2 px-4
        border border-[#64afdd]
        text-lg text-[#64afdd]
        hover:bg-[#64afdd] 
        hover:text-white
        transition-colors duration-300
      "
    >
      ←
    </button>
  );
}