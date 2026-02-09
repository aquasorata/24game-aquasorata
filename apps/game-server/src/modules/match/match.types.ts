import { CheckFailReason } from '../judge/eval24';

export type QueueJoinPayload = {
  userId: string;
  username: string;
};

export type QueueStatusPayload = {
  status: 'idle' | 'queued';
  size: number;
};

export type MatchFoundPayload = {
  matchId: string;
};

export type MatchStartPayload = {
  matchId: string;
  puzzle: string;
  serverStartTime: string;
  players: { userId: string }[];
};

export type MatchSubmitPayload = {
  matchId: string;
  expression: string;
};

export type MatchSubmitResultPayload =
  | {
      ok: true;
      reason: null;
      value: number | null;
    }
  | {
      ok: false;
      reason: CheckFailReason;
      value: number | null;
    };

export type MatchResultPayload = {
  matchId: string;
  winnerId: string;
  winnerTimeMs: number;
  rating: Record<
    string,
    {
      before: number;
      after: number;
      delta: number;
    }
  >;
};
