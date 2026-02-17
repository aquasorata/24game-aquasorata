import { useEffect, useState } from 'react';
import { useSolo } from '../gameserver/useSolo';
import { BackButton } from './BackButton ';
import { MenuButton } from './MenuButton';
// import { useAuth } from '../../app/providers/auth-provider';

export default function SoloPage() {
//   const { me, isAuthed, setMe } = useAuth();
  const { userId, status, match, timerMs, submitMsg, result, joinQueue, leaveQueue, submit } = useSolo();
  const [expression, setExpression] = useState('');

  useEffect(() => {
    if (match?.matchId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpression('');
    }
  }, [match]);

  return (
    <div className="
      min-h-screen 
      p-3 mobile-m:p-4 mobile-l:p-5 tablet:p-6
      flex items-center justify-center
    ">
      <div className="
        w-full 
        max-w-sm mobile-l:max-w-md tablet:max-w-xl laptop:max-w-2xl
        border border-[#64afdd] mobile-s:border-[#64afdd]
        bg-white/95 backdrop-blur-md 
        p-4 mobile-l:p-6
        space-y-4
      ">
        <div className="
          flex flex-col tablet:flex-row
          gap-4 tablet:gap-0
          items-center justify-between
        ">
          <BackButton state={status}/>
          <div className="text-lg font-semibold uppercase text-[#64afdd]">24 Game — Solo Mode</div>
          <MenuButton/>
        </div>

        <div className="border flex flex-row justify-between border-[#64afdd]">  
          <div className="p-4">
            <div className="text-sm text-slate-700 uppercase">Status</div>
            <div className="text-base font-semibold uppercase text-[#64afdd]">{status}</div>
          </div>
          <div className="p-4">
            <div className="text-sm text-slate-700 uppercase">Mode</div>
            <div className="text-base font-semibold uppercase text-[#64afdd]">Solo</div>
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

            <div className="
              flex flex-col tablet:flex-row
              gap-2
            ">
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
                  border px-3 py-2
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
                  <div>{result.winnerId == userId || result.winnerId == 'Guest' ? 'YOU WON' : 'YOU LOSE'}</div>
                  <div>TIME: {result.winnerId == 'Guest' ? (timerMs / 1000).toFixed(2) : (result.winnerTimeMs / 1000).toFixed(2)}s</div>
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
      </div>
    </div>
  );
}