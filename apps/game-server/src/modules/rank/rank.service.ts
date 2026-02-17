import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class RankService {
  async getTopRank() {
    const [topElo, fastestSolo] = await Promise.all([
      prisma.user.findFirst({
        orderBy: { elo: 'desc'},
        select: {
          username: true,
          elo: true,
        }
      }),
      prisma.matchPlayer.findFirst({
        where: { 
            correctAt: { not: null},
            match: { mode: 'SOLO' },
        },
        orderBy: { timeMs: 'asc' },
        include: { user: true, },
      }),
    ]);

    return {
      topElo,
      fastestSolo: fastestSolo
      ? {
          username: fastestSolo.user.username,
          timeMs: fastestSolo.timeMs,
        }
      : null,
    };
  }
}
