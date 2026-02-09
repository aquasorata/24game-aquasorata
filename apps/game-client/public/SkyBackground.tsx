'use client';

export function SkyBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-50 overflow-hidden pointer-events-none"
    >
      {/* {BG Images} */}
      <div
        className="
          absolute inset-0
          bg-[url(/bg-sky.png)]
          bg-cover bg-center bg-no
        "
      />

      {/* Cloud 1 */}
      <div
        className="
          absolute
          top-[4%] left-[-15%]
          h-45 w-110
          bg-[url(/clouds/clouds1.png)] bg-contain bg-no-repeat
          animate-[cloudDrift_60s_linear_infinite]
          [animation-delay:-10s]
          will-change-transform
        "
      />

      {/* Cloud 2 */}
      <div
        className="
          absolute
          top-[25%] left-[-0%]
          h-35 w-90
          bg-[url(/clouds/clouds2.png)] bg-contain bg-no-repeat
          animate-[cloudDrift_90s_linear_infinite]
          [animation-delay:-0s]
          will-change-transform
        "
      />

      {/* Cloud 3 */}
      <div
        className="
          absolute
          top-[38%] left-[-25%]
          h-27.5 w-65
          bg-[url(/clouds/clouds3.png)] bg-contain bg-no-repeat
          animate-[cloudDrift_60s_linear_infinite]
          [animation-delay:-5s]
          will-change-transform
        "
      />

      {/* Cloud 4 */}
      <div
        className="
          absolute
          top-[55%] left-[-40%]
          h-32.5 w-85
          bg-[url(/clouds/clouds4.png)] bg-contain bg-no-repeat
          animate-[cloudDrift_110s_linear_infinite]
          [animation-delay:-15s]
          will-change-transform
        "
      />

      {/* Cloud 5 */}
      <div
        className="
          absolute
          top-[70%] left-[-60%]
          h-47.5 w-115
          bg-[url(/clouds/clouds1.png)] bg-contain bg-no-repeat
          animate-[cloudDrift_88s_linear_infinite]
          [animation-delay:-25s]
          will-change-transform
        "
      />
    </div>
  );
}
