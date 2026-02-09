import { useEffect, useState } from "react";
import { useDuel } from '../gameserver/useDuel';
import { BackButton } from "./BackButton ";
import { useRouter } from "next/navigation";

export default function DuelPage() {
  const router = useRouter();
  const { username, userId, status, match, timerMs, submitMsg, result, joinQueue, leaveQueue, submit, oppDc, oppDcLeftMs } = useDuel();
  const [expression, setExpression] = useState('');

  useEffect(() => {
    if (!username || !userId) {
      router.replace('/login');
    }
  }, [username, userId, router]);

  useEffect(() => {
    if (match) {
      setExpression('');
    }
  }, [match?.matchId]);

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-xl border border-[#64afdd] bg-white/95 backdrop-blur-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <BackButton/>
          <div className="text-lg font-semibold uppercase text-[#64afdd]">24 Game — Duel Mode</div>
          <div className="text-base font-semibold text-[#64afdd]">{username ? `${username.slice(0, 8)}` : 'Guest'}</div>
        </div>

        <div className="border flex flex-row justify-between border-[#64afdd]">  
          <div className="p-4">
            <div className="text-sm text-slate-700 uppercase">Status</div>
            <div className="text-base font-semibold uppercase text-[#64afdd]">{status}</div>
          </div>
          <div className="p-4">
            <div className="text-sm text-slate-700 uppercase">Mode</div>
            <div className="text-base font-semibold uppercase text-[#64afdd]">Duel</div>
          </div>
        </div>

        {status === "idle" && (
          <button 
            className="
              w-full border border-[#64afdd] text-[#64afdd]
              duration-300 transition-colors text-base font-semibold
              py-3 uppercase cursor-pointer
              hover:bg-[#64afdd] hover:text-white" 
            onClick={joinQueue}>
            Join Queue
          </button>
        )}

        {status === "queued" && (
          <button 
            className="
              w-full border border-[#64afdd] text-[#64afdd]
              duration-300 transition-colors text-base font-semibold
              py-3 uppercase cursor-pointer
              hover:bg-[#64afdd] hover:text-white" 
            onClick={leaveQueue}>
            Leave Queue
          </button>
        )}

        {match && (status === "playing" || status === "done") && (
          <div className="border border-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-700 uppercase">Puzzle</div>
                <div className="text-2xl font-bold tracking-wide text-[#64afdd]">
                  {match.puzzle.split(",").join("  ")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-700 uppercase">Time</div>
                <div className="text-2xl font-bold text-[#64afdd]">{(timerMs / 1000).toFixed(2)}s</div>
              </div>
            </div>

            <div className="p-3 text-xs space-y-1 uppercase">
              <div className="font-bold uppercase text-[#64afdd]">Rules</div>
              <ol className="list-decimal list-inside text-slate-700">
                <li>Use all given numbers. No skipping and no reuse.</li>
                <li>Only the operators + − × ÷ are allowed.</li>
                <li>You can change the order using parentheses.</li>
              </ol>
              <div className="text-sm font-semibold text-[#64afdd]">
                Goal: make the expression evaluate to 24.
              </div>
            </div>

            <div className="flex gap-2">
              <input
                className={`
                  flex-1 border px-3 py-2
                  transition-colors duration-300 
                  ${
                    expression 
                    ? 'border-[#64afdd]' 
                    : 'border-slate-700'
                  }
                  outline-none focus:border-[#64afdd]`
                }
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                disabled={status !== 'playing'}
                readOnly={status !== 'playing'}
                placeholder="FOR EXAMPLE, (8-3)*(8-3)"
              />
              <button
                className={`
                  border px-4
                  transition-colors duration-300
                  font-semibold uppercase
                  ${
                    expression
                      ? 'border-[#64afdd] text-[#64afdd] hover:bg-[#64afdd] hover:text-white'
                      : 'border-slate-700 text-slate-700 hover:bg-slate-700 hover:text-white'
                  }
                  disabled:cursor-not-allowed
                `}
                onClick={() => submit(expression)}
                disabled={status !== 'playing' || expression === ''}
              >
                Submit
              </button>
            </div>

            {submitMsg && <div className="font-semibold text-sm text-[#64afdd]">{submitMsg}</div>}

            {result && (
              <>
                <div className="border bg-[#64afdd] border-[#64afdd] p-3 text-base font-semibold text-white space-y-1">
                  <div>{result.winnerId == userId ? 'YOU WON' : 'YOU LOSE'}</div>
                  <div>WINNER TIME: {(result.winnerTimeMs / 1000).toFixed(2)}s</div>
                </div>
                <div className="border border-[#64afdd] text-base font-semibold space-y-1 text-center">
                  <button
                    className="
                      cursor-pointer w-full p-3 
                      uppercase text-[#64afdd]
                      transition-colors duration-300
                      hover:bg-[#64afdd] hover:text-white
                    "
                    onClick={joinQueue}
                    disabled={status === "playing"}
                  >
                    Play Again
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {status === "playing" && oppDc && (
          <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
            <div className="rounded-2xl bg-white p-6 w-[320px] text-center space-y-2">
              <div className="text-lg font-semibold">Opponent disconnected</div>
              <div className="text-sm text-gray-600">
                Reconnect within {Math.ceil(oppDcLeftMs / 1000)} seconds
              </div>
              <div className="text-xs text-gray-400">
                Game will end automatically if reconnection times out.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
