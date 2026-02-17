'use client';

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { errorMessageMap, GameStatus, MatchResultPayload, MatchStart } from './useDuel';
import { getSocket } from "../socket";
import { useAuth } from "../../app/providers/auth-provider"

export function useSolo() {
  const { me } = useAuth();
  const username = me?.username;
  const userId = me?.userId;
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [match, setMatch] = useState<MatchStart | null>(null);
  const [timerMs, setTimerMs] = useState(0);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResultPayload | null>(null);

  useEffect(() => {
    const s = getSocket();
    socketRef.current =  s;

    s.on('queue:solo:status', (p) => {
      setStatus(p.status === 'queued' ? 'queued' : 'idle');
    });

    s.on("queue:solo:error", (p) =>
      setSubmitMsg(`queue:error: ${p.message}`)
    );

    s.on("match:solo:start", (p: MatchStart) => {
      setMatch(p);
      setStatus('playing');
      setResult(null);
      setSubmitMsg(null);
    });

    s.on("match:solo:submit:result", (p) => {
      setSubmitMsg(p.ok ? "CORRECT!" : `❌ ${errorMessageMap[p.reason] ?? "WRONG"}`);
    });

    s.on("match:solo:result", (p) => {
      setResult(p);
      setStatus("done");
    });

    return () => {
      s.off("queue:solo:status");
      s.off("queue:solo:error");
      s.off("match:solo:start");
      s.off("match:solo:submit:result");
      s.off("match:solo:result");
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
    socketRef.current?.emit('queue:solo:join', { userId });
  }

  function leaveQueue() {
    socketRef.current?.emit('queue:solo:leave');
  }

  function submit(expression: string) {
    if (!match) return;
    socketRef.current?.emit('match:solo:submit', {
      puzzle: match.puzzle,
      matchId: match.matchId,
      expression
    })
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
  }
}