const ALLOWED = /^[0-9+\-*/() \t\r\n.]+$/;

export type CheckFailReason =
  | 'empty'
  | 'bad_chars'
  | 'wrong_numbers'
  | 'not_24'
  | 'not_found_match'
  | 'not_found_player'
  | 'not_found_puzzel'
  | 'invalid_expression';

type ChechResult =
  | { ok: true; value: number }
  | { ok: false; reason: CheckFailReason; value?: number };

function tokenize(expr: string): string[] {
  const s = expr.replace(/\s+/g, '');
  const tokens: string[] = [];
  let i = 0;

  while (i < s.length) {
    const c = s[i];

    if ('+-*/()'.includes(c)) {
      tokens.push(c);
      i++;
      continue;
    }

    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      tokens.push(s.slice(i, j));
      i = j;
      continue;
    }

    throw new Error('invalid_token');
  }

  return tokens;
}

function precedence(op: string) {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/') return 2;
  return 0;
}

function toRpn(tokens: string[]) {
  const output: string[] = [];
  const ops: string[] = [];

  for (const t of tokens) {
    if (/^[0-9]+$/.test(t)) {
      output.push(t);
      continue;
    }

    if ('+-*/'.includes(t)) {
      while (
        ops.length &&
        '+-*/'.includes(ops[ops.length - 1]) &&
        precedence(ops[ops.length - 1]) >= precedence(t)
      ) {
        output.push(ops.pop()!);
      }
      ops.push(t);
      continue;
    }

    if (t === '(') {
      ops.push(t);
      continue;
    }

    if (t === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        output.push(ops.pop()!);
      }
      if (ops.pop() !== '(') throw new Error('mismatched_parenthesis');
      continue;
    }

    throw new Error('bad_token');
  }

  while (ops.length) {
    const op = ops.pop()!;
    if (op === '(' || op === ')') throw new Error('mismatched_parenthesis');
    output.push(op);
  }

  return output;
}

function evalRpn(rpn: string[]): number {
  const stack: number[] = [];

  for (const t of rpn) {
    if (/^[0-9]+$/.test(t)) {
      stack.push(Number(t));
      continue;
    }

    const a = stack.pop();
    const b = stack.pop();
    if (a === undefined || b === undefined) throw new Error('bad_expression');

    switch (t) {
      case '+':
        stack.push(b + a);
        break;
      case '-':
        stack.push(b - a);
        break;
      case '*':
        stack.push(b * a);
        break;
      case '/':
        stack.push(b / a);
        break;
      default:
        throw new Error('bad_operator');
    }
  }

  if (stack.length !== 1) throw new Error('bad_expression');
  return stack[0];
}

function multisetKey(nums: number[]) {
  return nums
    .slice()
    .sort((a, b) => a - b)
    .join(',');
}

function validateUsesPuzzle(expr: string, puzzleNums: number[]) {
  const nums = expr.match(/[0-9]+(?:\.[0-9]+)?/g)?.map(Number) ?? [];
  if (nums.length !== 4) return false;
  return multisetKey(nums) === multisetKey(puzzleNums);
}

export function eval24(expression: string, puzzleNums: number[]): ChechResult {
  const expr = expression.trim();

  if (!expr) return { ok: false, reason: 'empty' };
  if (!ALLOWED.test(expr)) return { ok: false, reason: 'bad_chars' };
  if (!validateUsesPuzzle(expr, puzzleNums))
    return { ok: false, reason: 'wrong_numbers' };

  try {
    const tokens = tokenize(expr);
    const rpn = toRpn(tokens);
    const value = evalRpn(rpn);

    if (Math.abs(value - 24) < 1e-9) {
      return { ok: true, value };
    }
    console.log('tokens: ', tokens);
    console.log('rpn: ', rpn);
    console.log('result: ', value);
    return { ok: false, reason: 'not_24', value };
  } catch {
    return { ok: false, reason: 'invalid_expression' };
  }
}
