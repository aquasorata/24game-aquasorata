import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { prisma } from '@repo/db';
import z from 'zod';
import { MatchService } from '../match/match.service';
import { MatchSubmitPayload, QueueJoinPayload } from '../match/match.types';
import type { SocketData } from '../types/socket.types';
import * as cookie from'cookie';
import { isAppError } from 'src/common/errors/app-error';
import { SHOULD_FORCE_SYNC, SHOULD_RELOGIN, SILENT_CODES } from 'src/common/errors/ws-error-policy';

type PendingReconnect = {
  matchId: string;
  userId: string;
  opponentUserId: string;
  deadlineAt: number;
  timer: NodeJS.Timeout;
};

const JoinSchema = z.object({ userId: z.string().min(1) });
const SubmitSchema = z.object({
  puzzle: z.string().min(1).optional(),
  matchId: z.string().min(1),
  expression: z.string().min(1),
});

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN, credentials: true },
})
export class MatchGateway implements OnGatewayInit ,OnGatewayDisconnect, OnGatewayConnection{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly matchService: MatchService) {}

  private pendingReconnect = new Map<string, PendingReconnect>();
  private userSockets = new Map<string, string>();

  bindSocket(userId: string, socketId: string) {
    this.userSockets.set(userId, socketId);
  }
  
  unbindSocket(userId: string, socketId: string) {
    const current = this.userSockets.get(userId);
    if (current === socketId) this.userSockets.delete(userId);
  }

  private emitToUser(userId: string, event: string, payload: any) {
    const socketId = this.userSockets.get(userId);
    if (!socketId) return;
    this.server.to(socketId).emit(event, payload);
  }

  afterInit(server: Server<any, any, any, SocketData>) {
    server.use((socket: Socket<any, any, any, SocketData>, next) => {
      const rawCookie = socket.handshake.headers.cookie ?? '';
      console.log('afterInit:rawCookie:', rawCookie);
      const { sid } = cookie.parse(rawCookie);
      console.log('afterInit:sid:', sid);
      if (!sid) {
        socket.data.userId = undefined;
        socket.data.username = undefined;
        socket.data.isGuest = true;
        return next();
      }

      this.matchService.getUserBySessionId(sid)
        .then((user) => {
          if (!user) {
            socket.data.isGuest = true;
            return next();
          }
  
          socket.data.userId = user.id;
          socket.data.username = user.username;
          socket.data.isGuest = false;

          this.bindSocket(user.id, socket.id);
  
          next();
        })
        .catch(() => {
          socket.data.isGuest = true;
          next();
        });
    });
  }

  async handleDisconnect(client: Socket<any, any, any, SocketData>) {
    const userId = client.data.userId;
    if (!userId) return;
    this.unbindSocket(userId, client.id);
    await this.onDisconnect(userId);
  }

  handleConnection(client: Socket<any, any, any, SocketData>) {
    const userId = client.data.userId;
    if (!userId) return;
    this.onReconnect(userId);
  }

  private graceMs = 15_000;
  async onDisconnect(userId: string) {
    const match = await prisma.match.findFirst({
      where: { 
        status: 'RUNNING', 
        players: { some: { userId } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { players: true },
    });

    if (!match) return;

    if (match.mode === 'SOLO') {
      this.matchService.leaveSoloQueue(userId);

      if (match.status !== 'RUNNING' || match.players.some((p) => p.correctAt) || !match.startedAt) return;

      const player = await prisma.matchPlayer.findFirst({
        where: {
          matchId: match.id,
          userId: userId,
        },
      });

      if (!player) return;

      const now = new Date();
      const timeMs = now.getTime() - match.startedAt.getTime();

      await prisma.$transaction(async (tx) => {
        await tx.matchPlayer.update({
          where: { id: player.id },
          data: { timeMs, result: 'SOLO' },
        });

        await tx.match.update({
          where: { id: match.id },
          data: {
            status: 'FINISHED',
            endedAt: new Date(),
          },
        });
      });
    }

    if (match.mode === 'DUEL') {
      this.matchService.leaveDuelQueue(userId);
  
      const opponent = match.players.find(p => p.userId !== userId);
      if(!opponent) return;

      if (this.pendingReconnect.has(userId)) return;

      const deadlineAt = Date.now() + this.graceMs;

      this.emitToUser(opponent.userId, 'match:opponent:disconnected', {
        matchId: match.id,
        graceMs: this.graceMs,
        deadlineAt,
        serverNow: Date.now(),
      });

      const timer = setTimeout(() => {
        const p = this.pendingReconnect.get(userId);
        if (!p) return;

        this.pendingReconnect.delete(userId);

        this.matchService
          .finishMatchByForfeit(p.matchId, userId, p.opponentUserId, {
            reasonW: 'OPPONENT_TIMEOUT',
            reasonL: 'DISCONNECT_TIMEOUT'
          })
          .then((res) => {
            const { matchId, winnerElo, winnerUserId, winnerTimeMs } = res;
            
            this.emitToUser(winnerUserId, 'match:duel:result', {
              matchId: matchId,
              winnerId: winnerUserId,
              winnerTimeMs,
              rating: { before: winnerElo.before, after: winnerElo.after, delta: winnerElo.delta},
              reason: 'OPPONENT_TIMEOUT',
            });
          })
          .catch((err) => {
            if (isAppError(err)) {
              if (SILENT_CODES.has(err.code)) return;
  
              if (SHOULD_FORCE_SYNC.has(err.code)) {
                this.emitToUser(p.opponentUserId, 'match:error', {
                  code: err.code,
                  message: err.messageSafe,
                  action: 'SYNC',
                  matchId: p.matchId,
                });
                return;
              }
              if (SHOULD_RELOGIN.has(err.code)) {
                this.emitToUser(p.opponentUserId, 'match:error', {
                  code: err.code,
                  message: err.messageSafe,
                  action: 'RELOGIN',
                });
                return;
              }
            }
            console.error('forfeit failed:', err);
            this.emitToUser(p.opponentUserId, 'match:error', {
              code: 'internal_error',
              message: 'Something went wrong',
            });
          });
      }, this.graceMs);

      this.pendingReconnect.set(userId, {
        matchId: match.id,
        userId,
        opponentUserId: opponent.userId,
        deadlineAt,
        timer,
      });
    }
  }

  onReconnect(userId: string) {
    const p = this.pendingReconnect.get(userId);
    if (!p) return;

    if (Date.now() > p.deadlineAt) return;

    clearTimeout(p.timer);
    this.pendingReconnect.delete(userId);

    this.emitToUser(p.opponentUserId, 'match:opponent:reconnected', {
      matchId: p.matchId,
      userId
    });

    this.emitToUser(userId, 'match:resume', {
      matchId: p.matchId,
    });
  }

  @SubscribeMessage('match:sync')
  async onMatchSync(
    @MessageBody() body: { matchId: string },
    @ConnectedSocket() socket: Socket<any, any, any, SocketData>
  ) {
    const userId = socket.data.userId;
    if (!userId) return socket.emit('match:sync:result', { ok: false, reason: 'unauthorized'});

    const state = await this.getMatchState(body.matchId, userId);
    socket.emit('match:sync:result', { ok: true, state});
  }

  async getMatchState(matchId: string, userId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true },
    });
    if (!match) throw new Error('match_not_found');

    const me = match.players.find(p => p.userId === userId);
    if (!me) throw new Error('not_in_match');

    return {
      matchId: match.id,
      mode: match.mode,
      status: match.status,
      puzzle: match.puzzle,
      serverStartTime: match.startedAt?.toISOString() ?? null,
      players: match.players.map(p => ({ userId: p.userId })),
    }
  }

  @SubscribeMessage('queue:solo:join')
  async onQueueJoinSolo(
    @MessageBody() body: unknown,
    @ConnectedSocket() socket: Socket<any, any, any, SocketData>,
  ) {
    const userId = socket.data.userId ?? `guest-${socket.id}`
    const isGuest = socket.data.isGuest ?? true;

    try {
      console.log(`Solo: userId:${userId} | socketId:${socket.id}`);
      const res = await this.matchService.joinSoloQueue(userId, socket.id, { isGuest });

      if (res.queueStatus) return socket.emit('queue:solo:status', res.queueStatus);

      if (res.matched) {
        const {a, foundA, start} = res.matched;

        this.server.to(a.socketId).emit('match:solo:found', foundA);

        const sa = this.server.sockets.sockets.get(a.socketId);

        await sa?.join(start.matchId);

        this.server.to(start.matchId).emit('match:solo:start', start);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknow_error';
      socket.emit('queue:solo:error', { message });
    }
  }

  @SubscribeMessage('queue:solo:leave')
  onQueueLeaveSolo(@ConnectedSocket() socket: Socket<any, any, any, SocketData>) {
    const userId: string | undefined = socket.data.userId;
    if (!userId) return;

    const status = this.matchService.leaveSoloQueue(userId);

    socket.emit('queue:solo:status', status);
  }

  @SubscribeMessage('match:solo:submit')
  async onSoloMatchSubmit(
    @MessageBody() body: unknown,
    @ConnectedSocket() socket: Socket<any, any, any, SocketData>,
  ) {
    const { puzzle, matchId, expression } = SubmitSchema.parse(
      body,
    ) as MatchSubmitPayload;

    const userId = socket.data.userId;
    const usernameUser = socket.data.username;
    const isGuest = socket.data.isGuest;

    console.log(`solo:userId`, userId);
    console.log(`solo:usernameUser`, usernameUser);
    console.log(`solo:isGuest`, isGuest);

    if (isGuest) {
      const { submitResult, matchResult } = this.matchService.submitGuest(
        {
          puzzle,
          matchId,
          expression,
        }
      );

      socket.emit('match:solo:submit:result', submitResult);

      if (matchResult)
        return this.server.to(matchId).emit('match:solo:result', matchResult);
    }

    if (!userId || !usernameUser) {
      socket.emit('match:solo:submit:result', {
        ok: false,
        reason: 'not_found_user',
        value: null,
      });
      return;
    }
    console.log('!userId || !usernameUser: Pass')
    const { submitResult, matchResult } = await this.matchService.submit(
      {
        matchId,
        expression,
      },
      userId,
    );
    console.log('submit: Pass')
    socket.emit('match:solo:submit:result', submitResult);
    if (matchResult) {
      console.log('matchResult: Pass')
      return this.server.to(matchId).emit('match:solo:result', matchResult);
    }
  }

  handleSoloDisconnect(client: Socket<any, any, any, SocketData>) {
    const userId: string | undefined = client.data.userId;
    this.matchService.onSoloDisconnect(userId);
  }

  @SubscribeMessage('queue:duel:join')
  async onQueueJoinDuel(
    @MessageBody() body: unknown,
    @ConnectedSocket() socket: Socket<any, any, any, SocketData>,
  ) {
    const { userId } = JoinSchema.parse(body) as QueueJoinPayload;

    try {
      console.log(`Duel: userId:${userId} | socketId:${socket.id}`);
      const res = await this.matchService.joinDuelQueue(userId, socket.id);

      if (res.infoUser?.userId) socket.data.userId = res.infoUser.userId;

      if (res.infoUser?.username) socket.data.username = res.infoUser.username;

      if (res.queueStatus) return socket.emit('queue:duel:status', res.queueStatus);

      if (res.matched) {
        const { a, b, foundA, foundB, start } = res.matched;

        this.server.to(a.socketId).emit('match:duel:found', foundA);
        this.server.to(b.socketId).emit('match:duel:found', foundB);

        const sa = this.server.sockets.sockets.get(a.socketId);
        const sb = this.server.sockets.sockets.get(b.socketId);

        await sa?.join(start.matchId);
        await sb?.join(start.matchId);

        this.server.to(start.matchId).emit('match:duel:start', start);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknow_error';
      socket.emit('queue:duel:error', { message });
    }
  }

  @SubscribeMessage('queue:duel:leave')
  onQueueLeaveDuel(@ConnectedSocket() socket: Socket<any, any, any, SocketData>) {
    const userId: string | undefined = socket.data.userId;
    if (!userId) return;
    const status = this.matchService.leaveDuelQueue(userId);

    socket.emit('queue:duel:status', status);
  }

  @SubscribeMessage('match:duel:submit')
  async onDuelMatchSubmit(
    @MessageBody() body: unknown,
    @ConnectedSocket() socket: Socket<any, any, any, SocketData>,
  ) {
    const { matchId, expression } = SubmitSchema.parse(
      body,
    ) as MatchSubmitPayload;

    const userId = socket.data.userId;
    const usernameUser = socket.data.username;

    if (!userId || !usernameUser) {
      socket.emit('match:duel:submit:result', {
        ok: false,
        reason: 'not_found',
        value: null,
      });
      return;
    }

    const { submitResult, matchResult } = await this.matchService.submit(
      {
        matchId,
        expression,
      },
      userId,
    );

    socket.emit('match:duel:submit:result', submitResult);

    if (matchResult)
      return this.server.to(matchId).emit('match:duel:result', matchResult);
  }

  async handleDuelDisconnect(client: Socket<any, any, any, SocketData>) {
    const userId: string | undefined = client.data.userId;
    if (!userId) return;
    await this.onDisconnect(userId);
  }

  @SubscribeMessage('match:duel:forfeit')
  async onDuelForfeit(
    @MessageBody() body: { matchId: string },
    @ConnectedSocket() socket: Socket<any, any, any, SocketData>,
  ) {
    const userId = socket.data.userId;
    if (!userId) {
      return socket.emit('match:duel:forfeit:result', {
        ok: false,
        reason: 'unauthorized',
      });
    }
  
    try {
      const pending = this.pendingReconnect.get(userId);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingReconnect.delete(userId);
      }
  
      const match = await prisma.match.findUnique({
        where: { id: body.matchId },
        include: { players: true },
      });
  
      if (!match) {
        return socket.emit('match:duel:forfeit:result', {
          ok: false,
          reason: 'match_not_found',
        });
      }
  
      const opponent = match.players.find(p => p.userId !== userId);
      if (!opponent) {
        return socket.emit('match:duel:forfeit:result', {
          ok: false,
          reason: 'opponent_not_found',
        });
      }
  
      const res = await this.matchService.finishMatchByForfeit(
        match.id,
        userId,
        opponent.userId,
        { reasonW: 'OPPONENT_FORFEIT', reasonL: 'MANUAL_FORFEIT' },
      );
  
      const { winnerUserId, winnerElo, winnerTimeMs } = res;
  
      this.server.to(match.id).emit('match:duel:result', {
        matchId: match.id,
        winnerId: winnerUserId,
        winnerTimeMs,
        rating: {
          before: winnerElo.before,
          after: winnerElo.after,
          delta: winnerElo.delta,
        },
        reason: 'OPPONENT_FORFEIT',
      });
  
    } catch (err) {
      console.error('forfeit error:', err);
      socket.emit('match:duel:forfeit:result', {
        ok: false,
        reason: 'internal_error',
      });
    }
  }
}
