import { Injectable } from '@nestjs/common';
import { MatchMode, MatchStatus, prisma } from '@repo/db';
import {
  MatchFoundPayload,
  MatchResultPayload,
  MatchStartPayload,
  MatchSubmitPayload,
  MatchSubmitResultPayload,
  QueueJoinPayload,
  QueueStatusPayload,
} from './match.types';
import { makeSeed, puzzleFromSeed, puzzleToString } from '../puzzle/puzzle';
import { eval24 } from '../judge/eval24';
import { RatingService } from '../rating/rating.service';
import { updateElo } from '../rating/elo';
import { AppError } from 'src/common/errors/app-error';

type QueueItem = { socketId: string; userId: string; username: string };

type ForfeitResult = {
  matchId: string;
  winnerUserId: string;
  loserUserId: string;
  winnerElo: { before: number; after: number; delta: number };
  loserElo: { before: number; after: number; delta: number };
  winnerTimeMs: number;
};

@Injectable()
export class MatchService {
  constructor(private readonly rating: RatingService) {}

  private soloQueue: QueueItem[] = [];
  private duelQueue: QueueItem[] = [];

  async getUserBySessionId(sid: string) {
    const u = await prisma.user.findUnique({ where: { id: sid } });

    if (!u) throw new Error('user_not_found');

    return { id: u.id, username: u.username };
  }

  async joinSoloQueue(
    userId: string,
    socketId: string,
  ): Promise<{
    queueStatus?: QueueStatusPayload;
    matched?: {
      a: { socketId: string; userId: string };
      foundA: MatchFoundPayload;
      start: MatchStartPayload;
    };
  }> {
    const u = await prisma.user.findUnique({ where: { id: userId } });

    if (!u) throw new Error('user_not_found');

    const usernameUser = u.username;

    if (u) console.log(`joinSoloQueue: ${userId} | ${socketId}`);

    if (this.soloQueue.some((q) => q.userId === userId))
      return { queueStatus: { status: 'queued', size: this.soloQueue.length } };

    this.soloQueue.push({ socketId, userId, username: usernameUser });
    console.log('soloQueue: ', this.soloQueue.map(q => ({
      userId: q.userId,
      socketId: q.socketId
    })));

    if (this.soloQueue.length < 1)
      return { queueStatus: { status: 'queued', size: this.soloQueue.length } };

    const a = this.soloQueue.shift()!;

    const seed = makeSeed();
    const nums = puzzleFromSeed(seed);
    const puzzle = puzzleToString(nums);

    const match = await prisma.match.create({
      data: {
        mode: 'SOLO',
        status: 'WAITING',
        seed,
        puzzle,
        players: { create: [{ userId: a.userId }]}
      },
      include: { players: true },
    });

    const startedAt = new Date();
    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'RUNNING', startedAt },
    });

    const start: MatchStartPayload = {
      matchId: match.id,
      puzzle,
      serverStartTime: startedAt.toISOString(),
      players: match.players.map((p) => ({ userId: p.userId })),
    };

    return {
      matched: {
        a,
        foundA: { matchId: match.id },
        start,
      },
    };
  }

  leaveSoloQueue(userId: string): QueueStatusPayload {
    const idx = this.soloQueue.findIndex((q) => q.userId === userId);
    if (idx >= 0) this.soloQueue.splice(idx, 1);
    return { status: 'idle', size: this.soloQueue.length };
  }

  onSoloDisconnect(userId?: string) {
    if (!userId) return;
    const idx = this.soloQueue.findIndex((q) => q.userId === userId);
    if (idx >= 0) this.soloQueue.splice(idx, 1);
  }

  async joinDuelQueue(
    userId: string,
    socketId: string,
  ): Promise<{
    infoUser?: QueueJoinPayload;
    queueStatus?: QueueStatusPayload;
    matched?: {
      a: { socketId: string; userId: string };
      b: { socketId: string; userId: string };
      foundA: MatchFoundPayload;
      foundB: MatchFoundPayload;
      start: MatchStartPayload;
    };
  }> {
    const u = await prisma.user.findUnique({ where: { id: userId } });

    if (!u) throw new Error('user_not_found');

    const usernameUser = u.username;

    if (u) console.log(`joinDuelQueue: ${userId} | ${socketId}`);

    if (this.duelQueue.some((q) => q.userId === userId))
      return { queueStatus: { status: 'queued', size: this.duelQueue.length } };

    this.duelQueue.push({ socketId, userId, username: usernameUser });
    console.log('duelQueue: ', this.duelQueue.map(q => ({
      userId: q.userId,
      socketId: q.socketId
    })));

    if (this.duelQueue.length < 2)
      return { infoUser: { userId: userId, username: usernameUser}, queueStatus: { status: 'queued', size: this.duelQueue.length } };

    const a = this.duelQueue.shift()!;
    const b = this.duelQueue.shift()!;

    const seed = makeSeed();
    const nums = puzzleFromSeed(seed);
    const puzzle = puzzleToString(nums);

    const match = await prisma.match.create({
      data: {
        mode: 'DUEL',
        status: 'WAITING',
        seed,
        puzzle,
        players: { create: [{ userId: a.userId }, { userId: b.userId }] },
      },
      include: { players: true },
    });

    const startedAt = new Date();
    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'RUNNING', startedAt },
    });

    const start: MatchStartPayload = {
      matchId: match.id,
      puzzle,
      serverStartTime: startedAt.toISOString(),
      players: match.players.map((p) => ({ userId: p.userId })),
    };

    return {
      matched: {
        a,
        b,
        foundA: { matchId: match.id },
        foundB: { matchId: match.id },
        start,
      },
    };
  }

  leaveDuelQueue(userId: string): QueueStatusPayload {
    const idx = this.duelQueue.findIndex((q) => q.userId === userId);
    if (idx >= 0) this.duelQueue.splice(idx, 1);
    return { status: 'idle', size: this.duelQueue.length };
  }

  onDisconnect(userId?: string) {
    if (!userId) return;
    const idx = this.duelQueue.findIndex((q) => q.userId === userId);
    if (idx >= 0) this.duelQueue.splice(idx, 1);
  }

  async finishMatchByForfeit(
    matchId: string,
    disconnectedUserId: string,
    opponentUserId: string,
    opts?: { kFactor?: number; reason?: string },
  ): Promise<ForfeitResult> {
    const reason = opts?.reason ?? 'FORFEIT_DISCONNECT';

    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: { players: { include: { user: true } } },
      });

      if (!match || !match.startedAt) throw new AppError('match_not_found', 'Match not found', 'not_found');

      if (match.status ===  MatchStatus.FINISHED) throw new AppError('match_already_finished', 'Match already finished',  'conflict');

      if (match.mode !== MatchMode.DUEL) throw new AppError('forfeit_only_for_duel', 'Forfeit is only for duel matches', 'bad_request');

      if (match.status !== MatchStatus.RUNNING) throw new AppError('match_not_running', 'Match is not running', 'conflict');

      const loserMP = match.players.find((p) => p.userId === disconnectedUserId);
      const winnerMP = match.players.find((p) => p.userId === opponentUserId);

      if (!loserMP || !winnerMP) throw new AppError('players_not_in_match', 'Player not in this match', 'unauthorized');

      const winnerBefore = winnerMP.user.elo;
      const loserBefore = loserMP.user.elo;

      const winnerAfter = updateElo(winnerBefore, loserBefore, 1);
      const loserAfter = updateElo(loserBefore, winnerBefore, 0);

      const winnerDelta = winnerAfter - winnerBefore;
      const loserDelta = loserAfter - loserBefore;

      const endedAt = new Date();
      const winnerTimeMs = endedAt.getTime() - match.startedAt.getTime();

      await tx.match.update({
        where: { id: match.id },
        data: {
          status: 'FINISHED',
          endedAt
        }
      });

      await tx.matchPlayer.updateMany({
        where: { matchId: match.id, userId: winnerMP.userId },
        data: { result: 'WIN'}
      });

      await tx.matchPlayer.updateMany({
        where: { matchId: match.id, userId: loserMP.userId },
        data: { result: 'LOSE' },
      });

      await tx.user.update({
        where: { id: winnerMP.userId },
        data: {
          elo: winnerAfter,
          games: { increment: 1 },
          wins: { increment: 1 },
        }
      });

      await tx.user.update({
        where: { id: loserMP.userId },
        data: {
          elo: loserAfter,
          games: { increment: 1 },
          losses: { increment: 1},
        }
      });

      await tx.ratingLog.createMany({
        data: [
          {
            userId: winnerMP.userId,
            matchId: match.id,
            before: winnerBefore,
            after: winnerAfter,
            delta: winnerDelta,
            reason,
          },
          {
            userId: loserMP.userId,
            matchId: match.id,
            before: loserBefore,
            after: loserAfter,
            delta: loserDelta,
            reason
          },
        ],
      });

      return {
        matchId: match.id,
        winnerUserId: winnerMP.userId,
        loserUserId: loserMP.userId,
        winnerElo: { before: winnerBefore, after: winnerAfter, delta: winnerDelta },
        loserElo: { before: loserBefore, after: loserAfter, delta: loserDelta },
        winnerTimeMs,
      }
    });
  }

  async submit(
    payload: MatchSubmitPayload,
    userId: string,
  ): Promise<{
    submitResult: MatchSubmitResultPayload;
    matchResult?: MatchResultPayload;
  }> {
    const { matchId, expression } = payload;
    const u = await prisma.user.findUnique({ where: { id: userId } }); 

    if (!u) return { submitResult: { ok: false, reason: 'not_found_player', value: null } };

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: { include: { user: true } } },
    });
    if (!match || match.status !== 'RUNNING' || !match.startedAt)
      return { submitResult: { ok: false, reason: 'not_found_match', value: null } };

    const mp = match.players.find((p) => p.userId === userId);
    if (!mp)
      return { submitResult: { ok: false, reason: 'not_found_player', value: null } };

    const puzzleNums = match.puzzle.split(',').map(Number);
    const verdict = eval24(expression, puzzleNums);

    await prisma.submission.create({
      data: { matchPlayerId: mp.id, expression, isCorrect: verdict.ok },
    });

    const submitResult: MatchSubmitResultPayload = verdict.ok
      ? {
          ok: true,
          reason: null,
          value: ('value' in verdict ? verdict.value : null) ?? null,
        }
      : {
          ok: false,
          reason: verdict.reason,
          value: ('value' in verdict ? verdict.value : null) ?? null,
        };

    if (!verdict.ok) return { submitResult };

    if (mp.correctAt) return { submitResult };

    const now = new Date();
    const timeMs = now.getTime() - match.startedAt.getTime();

    const fresh = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true },
    });

    if (!fresh || fresh.status !== 'RUNNING') return { submitResult };

    if (fresh.players.some((p) => p.correctAt)) return { submitResult };

    await prisma.matchPlayer.update({
      where: { id: mp.id },
      data: { correctAt: now, timeMs, result: 'WIN' },
    });

    const loserMP = fresh.players.find((p) => p.userId !== userId)!;
    await prisma.matchPlayer.update({
      where: { id: loserMP.id },
      data: { result: 'LOSE' },
    });

    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'FINISHED', endedAt: now },
    });

    const rating = await this.rating.applyDuelResult({
      matchId,
      winnerId: userId,
      loserId: loserMP.userId,
      outcome: 'WIN_LOSE',
    });

    const matchResult: MatchResultPayload = {
      matchId,
      winnerId: rating.winner.userId,
      winnerTimeMs: timeMs,
      rating: {
        [rating.winner.userId]: {
          before: rating.winner.before,
          after: rating.winner.after,
          delta: rating.winner.delta,
        },
        [rating.loser.userId]: {
          before: rating.loser.before,
          after: rating.loser.after,
          delta: rating.loser.delta,
        },
      },
    };

    return { submitResult, matchResult };
  }
}
