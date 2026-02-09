'use client';

import Link from "next/link";
import { useAuth } from "./providers/auth-provider";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { me } = useAuth();

  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-md w-full border border-[#64afdd] bg-white/95 backdrop-blur-md p-6 space-y-4">
        <div className="text-center text-xl text-[#64afdd] font-semibold drop-shadow-sm uppercase">Battle of 24</div>
        <p className="text-sm text-center text-[#64afdd] font-semibold uppercase">Enter the Arena. Earn Your Rank.</p>
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
              popoverTarget="login-confirm"
              className="
                block w-full text-center py-3 border border-[#64afdd] 
                text-[#64afdd] font-semibold uppercase
                duration-300 transition-colors
                hover:bg-[#64afdd] hover:text-white
              "
            >
              Duel
            </button>
            <div 
              id="login-confirm" 
              popover="auto" 
              className="
                fixed left-1/2 top-1/2
                -translate-x-1/2 -translate-y-1/2
                w-120 p-4 shadow-xl
                bg-white/95 text-[#64afdd] text-center
                border border-[#64afdd]
                transition-discrete duration-300
                starting:open:opacity-0
                open:opacity-100
                not-open:opacity-0
              "
            >
              <h3 className="font-semibold text-lg mb-2 text-center">Login Required</h3>
              <div className="mb-4">You need to log in before playing Duel mode.</div>
              <div className='flex justify-between gap-4'>
                <button
                  popoverTarget="login-confirm"
                  popoverTargetAction="hide"
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
          </div>
        }
        <div>
          <button
            popoverTarget="how-to-play"
            className="
              block w-full text-center py-3 border border-[#64afdd] 
              text-[#64afdd] font-semibold uppercase
              duration-300 transition-colors
              hover:bg-[#64afdd] hover:text-white
            "
          >
            How to Play
          </button>
          <div 
            id="how-to-play" 
            popover="auto" 
            className="
              fixed left-1/2 top-1/2
              -translate-x-1/2 -translate-y-1/2
              w-80 p-4 shadow-xl
              bg-white text-[#64afdd]
              border border-[#64afdd]
              transition-discrete duration-300
              starting:open:opacity-0
              open:opacity-100
              not-open:opacity-0
            "
          >
            <h3 className="font-semibold text-lg mb-2 text-center">How to Play</h3>
            <ul className="text-sm space-y-1 list-disc pl-5 mb-4">
              <li>Use all numbers.</li>
              <li>Only + − × ÷ are allowed.</li>
              <li>You can use parentheses.</li>
              <li>Make the result equal 24.</li>
            </ul>
            <button
              popoverTarget="how-to-play"
              popoverTargetAction="hide"
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
        </div>
      </div>
    </main>
  );
}
