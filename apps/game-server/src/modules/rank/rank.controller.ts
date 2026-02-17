import { Controller, Get } from '@nestjs/common';
import { RankService } from './rank.service';

@Controller('rank')
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Get('top')
  async getTopRank() {
    return this.rankService.getTopRank();
  }
}
