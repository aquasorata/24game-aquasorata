import { Injectable } from '@nestjs/common';
import { makeSeed, puzzleFromSeed, puzzleToString } from './puzzle';

@Injectable()
export class PuzzleService {
  createPuzzle() {
    const seed = makeSeed();
    const nums = puzzleFromSeed(seed);
    return {
      seed,
      nums,
      puzzleToString: puzzleToString(nums),
    };
  }

  parsePuzzle(puzzle: string): number[] {
    return puzzleFromSeed(puzzle);
  }
}
