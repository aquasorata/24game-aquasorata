'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../socket';
import { useAuth } from "../../app/providers/auth-provider"
import toast from "react-hot-toast";

export type MatchStart = {
  matchId: string;
  puzzle: string;
  serverStartTime: string;
  players: { userId: string }[]
}

export type GameStatus = 'idle' | 'queued' | 'playing' | 'done';

export type RatingChange = {
  before: number;
  after: number;
  delta: number;
};

export type MatchResultPayload = {
  matchId: string;
  winnerId: string;
  winnerTimeMs: number;
  rating: Record<string, RatingChange>;
};

export type OpponentDisconnectedPayload = {
  matchId: string;
  graceMs: number;
  deadlineAt: number;
  serverNow: number;
};

export function useDuel() {
  const { me } = useAuth();
  const username = me?.username;
  const userId = me?.userId;
  const socketRef = useRef<Socket | null>(null);

  const [status, setStatus] = useState<GameStatus>('idle');
  const [match, setMatch] = useState<MatchStart | null>(null);
  const [timerMs, setTimerMs] = useState(0);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResultPayload | null>(null);
  const [oppDc, setOppDc] = useState<OpponentDisconnectedPayload | null>(null);
  const [oppDcLeftMs, setOppDcLeftMs] = useState<number>(0);

  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    s.on('queue:duel:status', (p) => {
      setStatus(p.status === 'queued' ? 'queued' : 'idle');
    });

    s.on("queue:duel:error", (p) =>
      setSubmitMsg(`queue:error: ${p.message}`)
    );

    s.on("match:duel:start", (p: MatchStart) => {
      setMatch(p);
      setStatus('playing');
      setResult(null);
      setSubmitMsg(null);
      toast.success("Duel Start!");
    });

    s.on("match:duel:submit:result", (p) => {
      setSubmitMsg(p.ok ? "CORRECT!" : `❌ ${p.reason ?? "WRONG"}`);
    });

    s.on("match:duel:result", (p) => {
      setOppDc(null);
      setTimerMs(p.winnerTimeMs);
      setOppDcLeftMs(0);
      setResult(p);
      setStatus("done");
    });

    s.on("match:opponent:disconnected", (p: OpponentDisconnectedPayload) => {
      setOppDc(p);
      toast.error('Opponent disconnected!');
    })

    s.on("match:opponent:reconnected", (p: OpponentDisconnectedPayload) => {
      setOppDc(null);
      setOppDcLeftMs(0);
      toast.success("Opponent reconnected!");
    })

    s.on('match:resume', (p: { matchId: string }) => {
      s.emit('match:sync', { matchId: p.matchId });
    })

    s.on('match:sync:result', (res: any) => {
      if (!res.ok) {
        toast.error('Resume failed');
        return;
      }

      setStatus('playing');
      setMatch({
        matchId: res.state.matchId,
        puzzle: res.state.puzzle,
        serverStartTime: res.state.serverStartTime,
        players: res.state.players,
      });

      toast.success('Reconnected!');
    })

    return () => {
      s.off("queue:duel:status");
      s.off("queue:duel:error");
      s.off("match:duel:start");
      s.off("match:duel:submit:result");
      s.off("match:duel:result");
      s.off("match:opponent:disconnected");
      s.off("match:opponent:reconnected");
      s.off("match:resume");
      s.off("match:sync");
      s.off("match:sync:result");
    };
  }, []);

  useEffect(() => {
    if (!match || status !== "playing") return;

    const start = new Date(match.serverStartTime).getTime();

    const t = setInterval(() => {
      setTimerMs(Date.now() - start);
    }, 50);

    return () => clearInterval(t);
  }, [match, status]);

  function joinQueue() {
    socketRef.current?.emit("queue:duel:join", { userId });
  }

  function leaveQueue() {
    socketRef.current?.emit("queue:duel:leave");
  }

  useEffect(() => {
    if (!oppDc) return;

    const offset = Date.now() - oppDc.serverNow;
    const tick = () => {
      const serverNowFromClient = Date.now() - offset;
      const left = Math.max(0, oppDc.deadlineAt - serverNowFromClient);
      setOppDcLeftMs(left);
    }

    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [oppDc]);

  function submit(expression: string) {
    if (!match) return;
    socketRef.current?.emit("match:duel:submit", {
      matchId: match.matchId,
      expression,
    });
  }

  return {
    username,
    userId,
    status,
    match,
    timerMs,
    submitMsg,
    result,
    joinQueue,
    leaveQueue,
    submit,
    oppDc,
    oppDcLeftMs,
  };
}