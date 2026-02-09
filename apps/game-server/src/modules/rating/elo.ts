export type EloConfig = {
  k: number;
  scale: number;
};

export const DEFAULT_ELO: EloConfig = {
  k: 32,
  scale: 400,
};

export function expectedScore(
  ra: number,
  rb: number,
  scale = DEFAULT_ELO.scale,
) {
  return 1 / (1 + Math.pow(10, (rb - ra) / scale));
}

export function updateElo(
  ra: number,
  rb: number,
  sa: 0 | 0.5 | 1,
  cfg: EloConfig = DEFAULT_ELO,
) {
  const ea = expectedScore(ra, rb, cfg.scale);
  return Math.round(ra + cfg.k * (sa - ea));
}
