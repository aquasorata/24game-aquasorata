'use client';

import Link from "next/link";
import { useAuth } from "./providers/auth-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ModulePortal from "@/lib/components/ModalPortal";
import { MenuButton } from "@/lib/components/MenuButton";

export default function HomePage() {
  const router = useRouter();
  const { me } = useAuth();
  const [openHowToPlay, setOpenHowToPlay] = useState(false);
  const [openLoginConfirm, setOpenLoginConfirm] = useState(false);
  const [openLoginConfirm2, setOpenLoginConfirm2] = useState(false);

  return (
    <div className="
      laptop-l:min-h-screen
      laptop-l:mt-0 mobile-m:mt-10
      flex items-center justify-center
      p-8 
    ">
      <div className="
        max-w-md w-full 
        border border-[#64afdd]
        bg-white/95 backdrop-blur-md 
        p-6 space-y-4
      ">
        <div className="
          text-center 
          text-lg mobile-m:text-xl mobile-l:text-2xl 
          tablet:text-3xl laptop:text-4xl
          text-[#64afdd] font-semibold 
          drop-shadow-sm uppercase
        ">
          Battle of 24
        </div>
        <p className="
          mt-1 mobile-l:mt-2
          text-xs mobile-s:text-sm mobile-l:text-base
          text-center 
          text-[#64afdd] font-semibold 
          uppercase tracking-wide
        ">
          Enter the Arena. Earn Your Rank.
        </p>
        <div className="flex justify-around">
          <MenuButton/>
        </div>
        <Link 
          className="
            block w-full text-center py-3 border border-[#64afdd] 
            text-[#64afdd] font-semibold uppercase
            duration-300 transition-colors
            hover:bg-[#64afdd] hover:text-white
          "
          href="/play?mode=solo"
        >
          Play
        </Link>
        {
        me ?
          <Link 
            className="
              block w-full text-center py-3 border border-[#64afdd] 
              text-[#64afdd] font-semibold uppercase
              duration-300 transition-colors
              hover:bg-[#64afdd] hover:text-white
            "
            href="/play?mode=duel"
          >
            Duel
          </Link> 
        :
          <div>
            <button
              onClick={() => setOpenLoginConfirm(true)}
              className="
                block w-full text-center py-3 border border-[#64afdd] 
                text-[#64afdd] font-semibold uppercase
                duration-300 transition-colors
                hover:bg-[#64afdd] hover:text-white
              "
            >
              Duel
            </button>
            <ModulePortal open={openLoginConfirm} onClose={() => setOpenLoginConfirm(false)}>
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
                  Login Required
                </h3>
                <div className="
                  mb-4
                  text-sm
                  uppercase
                ">
                  You need to log in before playing Duel mode.
                </div>
                <div className='flex justify-between gap-4'>
                  <button
                    onClick={() => setOpenLoginConfirm(false)}
                    className="
                      block w-full text-center py-3 border border-[#64afdd] 
                      text-[#64afdd] font-semibold uppercase
                      duration-300 transition-colors
                      hover:bg-[#64afdd] hover:text-white
                    "
                  >
                    Cancel
                  </button>
                  <button 
                    className="
                      block w-full text-center py-3 border border-[#64afdd] 
                      text-[#64afdd] font-semibold uppercase
                      duration-300 transition-colors
                      hover:bg-[#64afdd] hover:text-white
                    "
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </button>
                </div>
              </div>
            </ModulePortal>
          </div>
        }
        <div>
          <button
            onClick={() => setOpenHowToPlay(true)}
            className="
              block w-full text-center py-3 border border-[#64afdd] 
              text-[#64afdd] font-semibold uppercase
              duration-300 transition-colors
              hover:bg-[#64afdd] hover:text-white
            "
          >
            How to Play
          </button>
          <ModulePortal open={openHowToPlay} onClose={() => setOpenHowToPlay(false)}>
            <div 
              className="
                popover-panel
                fixed left-1/2 top-1/2
                -translate-x-1/2 -translate-y-1/2
                w-65 mobile-s:w-75 mobile-l:w-100
                tablet:w-105 laptop:w-120
                p-4 mobile-l:p-6
                bg-white text-[#64afdd]
                border border-[#64afdd]
              "
            >
              <h3 className="font-semibold text-lg mb-3 text-center uppercase">
                How to Play
              </h3>
              <div className="text-sm space-y-3 mb-4 uppercase">
                <div>
                  <p className="font-semibold">Goal</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Make the final result equal 24.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Rules</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use all numbers exactly once.</li>
                    <li>Only + − × ÷ are allowed.</li>
                    <li>Parentheses can be used.</li>
                    <li className="text-gray-400">
                      You can give up at any time.
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-[#64afdd]">
                        <li>But I want you to try your best. I’m cheering for you.</li>
                      </ul>
                    </li>
                    <li>If time runs out, the round counts as a loss.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Account</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You can play without logging in.</li>
                    <li>Log in to save your progress and match history.</li>
                    <li>Click your username to log in or log out.</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setOpenHowToPlay(false)}
                className="
                  block w-full text-center py-3 border border-[#64afdd] 
                  text-[#64afdd] font-semibold uppercase
                  duration-300 transition-colors
                  hover:bg-[#64afdd] hover:text-white
                "
              >
                Close
              </button>
            </div>
          </ModulePortal>
        </div>
        {
          !me ?
            <div>
              <div 
              onClick={() => setOpenLoginConfirm2(true)}
              className="
                text-center 
                text-sm mobile-m:text-base mobile-l:text-xl
                text-[#64afdd] font-semibold 
                drop-shadow-sm uppercase
              ">
                Ready to go? Log in now
              </div>
              <ModulePortal open={openLoginConfirm2} onClose={() => setOpenLoginConfirm2(false)}>
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
                    Login Required
                  </h3>
                  <div className="
                    mb-4
                    text-sm
                    uppercase
                  ">
                    Log in to save your progress and continue playing.
                  </div>
                  <div className='flex justify-between gap-4'>
                    <button
                      onClick={() => setOpenLoginConfirm(false)}
                      className="
                        block w-full text-center py-3 border border-[#64afdd] 
                        text-[#64afdd] font-semibold uppercase
                        duration-300 transition-colors
                        hover:bg-[#64afdd] hover:text-white
                      "
                    >
                      Cancel
                    </button>
                    <button 
                      className="
                        block w-full text-center py-3 border border-[#64afdd] 
                        text-[#64afdd] font-semibold uppercase
                        duration-300 transition-colors
                        hover:bg-[#64afdd] hover:text-white
                      "
                      onClick={() => router.push("/login")}
                    >
                      Login
                    </button>
                  </div>
                </div>
              </ModulePortal>
            </div>
        : 
          null
        }
      </div>
    </div>
  );
}
