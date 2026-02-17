import crypto from 'crypto';

const TARGET = 24;
const EPSILON = 1e-6;

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

type Node = {
  value: number;
  expr: string;
};

function solve24(nums: number[]): string | null {
  function dfs(nodes: Node[]): string | null {
    if (nodes.length === 1) {
      if (Math.abs(nodes[0].value - TARGET) < EPSILON) {
        return nodes[0].expr;
      }
      return null;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;

        const rest = nodes.filter((_, idx) => idx !== i && idx !== j);

        const a = nodes[i];
        const b = nodes[j];

        const candidates: (Node | null)[] = [
          {
            value: a.value + b.value,
            expr: `(${a.expr}+${b.expr})`,
          },
          {
            value: a.value - b.value,
            expr: `(${a.expr}-${b.expr})`,
          },
          {
            value: a.value * b.value,
            expr: `(${a.expr}*${b.expr})`,
          },
          b.value !== 0
            ? {
                value: a.value / b.value,
                expr: `(${a.expr}/${b.expr})`,
              }
            : null,
        ];

        for (const candidate of candidates) {
          if (!candidate) continue;

          const result = dfs([...rest, candidate]);
          if (result) return result;
        }
      }
    }

    return null;
  }

  const startNodes: Node[] = nums.map((n) => ({
    value: n,
    expr: n.toString(),
  }));

  return dfs(startNodes);
}

export function generateSolvablePuzzle(): {
  seed: string;
  nums: number[];
  puzzle: string;
  solution: string;
} {
  while (true) {
    const seed = makeSeed();
    const nums = puzzleFromSeed(seed);
    const puzzle = puzzleToString(nums)

    const solution = solve24(nums);

    if (solution) {
      return {
        seed,
        nums,
        puzzle,
        solution,
      };
    }
  }
}
