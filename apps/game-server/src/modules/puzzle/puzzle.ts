import crypto from 'crypto';

export function makeSeed() {
  return crypto.randomBytes(8).toString('hex');
}
export function puzzleFromSeed(seed: string): number[] {
  const h = crypto.createHash('sha256').update(seed).digest();
  return [0, 1, 2, 3].map((i) => (h[i] % 9) + 1);
}
export function puzzleToString(nums: number[]) {
  return nums.join(',');
}
