import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { RatingModule } from '../rating/rating.module';

@Module({
  imports: [RatingModule],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
