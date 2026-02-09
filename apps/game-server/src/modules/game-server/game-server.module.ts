import { Module } from '@nestjs/common';
import { MatchModule } from '../match/match.module';
import { MatchGateway } from './match.gateway';

@Module({
  imports: [MatchModule],
  providers: [MatchGateway],
})
export class GameServerModule {}
