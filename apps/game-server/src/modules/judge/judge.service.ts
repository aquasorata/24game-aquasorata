import { Injectable } from '@nestjs/common';
import { CheckFailReason, eval24 } from './eval24';

export type JudgeResult =
  | { ok: true; value: number }
  | {
      ok: false;
      reason: CheckFailReason;
    };

@Injectable()
export class JudgeService {
  check24(expression: string, puzzle: number[]): JudgeResult {
    return eval24(expression, puzzle);
  }
}
