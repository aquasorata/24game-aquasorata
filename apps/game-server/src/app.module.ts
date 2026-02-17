import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PuzzleModule } from './modules/puzzle/puzzle.module';
import { RatingModule } from './modules/rating/rating.module';
import { JudgeService } from './modules/judge/judge.service';
import { JudgeModule } from './modules/judge/judge.module';
import { MatchModule } from './modules/match/match.module';
import { GameServerModule } from './modules/game-server/game-server.module';
import { UsersService } from './modules/users/users.service';
import { UsersController } from './modules/users/users.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { RankService } from './modules/rank/rank.service';
import { RankModule } from './modules/rank/rank.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PuzzleModule,
    RatingModule,
    JudgeModule,
    MatchModule,
    GameServerModule,
    UsersModule,
    AuthModule,
    RankModule,
  ],
  controllers: [AppController, UsersController, AuthController],
  providers: [AppService, JudgeService, UsersService, AuthService, RankService],
})
export class AppModule {}
