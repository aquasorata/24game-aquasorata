import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';
import { DEFAULT_ELO, updateElo, type EloConfig } from './elo';

export type DuelOutcome = 'WIN' | 'LOSE' | 'DRAW';

export type DuelRatingResult = {
  winner: { userId: string; before: number; after: number; delta: number };
  loser: { userId: string; before: number; after: number; delta: number };
};

@Injectable()
export class RatingService {
  async applyDuelResult(params: {
    matchId: string;
    winnerId: string;
    loserId: string;
    outcome?: 'WIN_LOSE' | 'DRAW';
    cfg?: EloConfig;
  }): Promise<DuelRatingResult> {
    const { matchId, winnerId, loserId, outcome = 'WIN_LOSE' } = params;
    const cfg = params.cfg ?? DEFAULT_ELO;

    const [winnerUser, loserUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: winnerId } }),
      prisma.user.findUnique({ where: { id: loserId } }),
    ]);

    if (!winnerUser || !loserUser) {
      throw new Error('rating_user_not_found');
    }

    const wBefore = winnerUser.elo;
    const lBefore = loserUser.elo;

    const wScore: 0 | 0.5 | 1 = outcome === 'DRAW' ? 0.5 : 1;
    const lScore: 0 | 0.5 | 1 = outcome === 'DRAW' ? 0.5 : 0;

    const wAfter = updateElo(wBefore, lBefore, wScore, cfg);
    const lAfter = updateElo(lBefore, wBefore, lScore, cfg);

    const wDelta = wAfter - wBefore;
    const lDelta = lAfter - lBefore;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: winnerId },
        data: {
          elo: wAfter,
          games: { increment: 1 },
          ...(outcome === 'DRAW'
            ? { draws: { increment: 1 } }
            : { wins: { increment: 1 } }),
        },
      }),
      prisma.user.update({
        where: { id: loserId },
        data: {
          elo: lAfter,
          games: { increment: 1 },
          ...(outcome === 'DRAW'
            ? { draws: { increment: 1 } }
            : { losses: { increment: 1 } }),
        },
      }),
      prisma.ratingLog.create({
        data: {
          userId: winnerId,
          matchId,
          before: wBefore,
          after: wAfter,
          delta: wDelta,
          reason: outcome === 'DRAW' ? 'duel_draw' : 'duel_win',
        },
      }),
      prisma.ratingLog.create({
        data: {
          userId: loserId,
          matchId,
          before: lBefore,
          after: lAfter,
          delta: lDelta,
          reason: outcome === 'DRAW' ? 'duel_draw' : 'duel_loss',
        },
      }),
    ]);

    return {
      winner: {
        userId: winnerId,
        before: wBefore,
        after: wAfter,
        delta: wDelta,
      },
      loser: {
        userId: loserId,
        before: lBefore,
        after: lAfter,
        delta: lDelta,
      },
    };
  }
}
