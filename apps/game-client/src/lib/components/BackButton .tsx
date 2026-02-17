'use client';

import { useRouter } from "next/navigation";
import { GameStatus } from "../gameserver/useDuel";
import { useState } from "react";
import ModulePortal from "./ModalPortal";

type BackButtonProps = {
  state: GameStatus;
  onForfeit?: () => void;
};

export function BackButton({ state, onForfeit }: BackButtonProps) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const isPlaying = state === 'playing';

  function handleClick() {
    if (isPlaying) {
      setOpenMenu(true)
      return;
    }

    router.replace('/');
  }

  function handleForfeit() {
    onForfeit?.();
    setOpenMenu(false);
    router.replace('/');
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          flex items-center py-2 px-4
          border text-lg
          ${
            isPlaying
             ? 'border-slate-700 text-slate-700 hover:bg-slate-700 hover:text-white'
             : 'border-[#64afdd] text-[#64afdd] hover:bg-[#64afdd] hover:text-white'
          }
          transition-colors duration-300
          disabled:cursor-not-allowed
        `}
      >
        ←
      </button>
      <ModulePortal open={openMenu} onClose={() => setOpenMenu(false)}>
        <div 
          className="
            popover-panel
            fixed left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            w-65 mobile-s:w-75 mobile-l:w-100
            tablet:w-105 laptop:w-120
            p-4 mobile-l:p-6
            shadow-xl
            bg-white/95 text-[#64afdd] text-center
            border border-[#64afdd]
          "
        >
          <h3 className="
            font-semibold
            text-lg mb-2
            text-center
            uppercase
          ">
            Give up this round?
          </h3>
          <div className="
            mb-4
            text-sm
            uppercase
          ">
            It’s okay — every try makes you better. You can always come back and try again.
          </div>
          <div className='flex justify-between gap-4'>
            <button
              onClick={() => setOpenMenu(false)}
              className="
                block w-full text-center py-3 border border-[#64afdd] 
                text-[#64afdd] font-semibold uppercase
                duration-300 transition-colors
                hover:bg-[#64afdd] hover:text-white
              "
            >
              Try again
            </button>
            <button 
              className="
                block w-full text-center py-3 border border-[#64afdd] 
                text-[#64afdd] font-semibold uppercase
                duration-300 transition-colors
                hover:bg-[#64afdd] hover:text-white
              "
              onClick={handleForfeit}
            >
              Give up
            </button>
          </div>
        </div>
      </ModulePortal>
    </>
  );
}