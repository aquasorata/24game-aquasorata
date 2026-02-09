export const SILENT_CODES = new Set([
  'match_already_finished',
  'match_not_running',
  'players_not_in_match',
]);

export const SHOULD_FORCE_SYNC = new Set([
  'match_not_found',
  'players_not_in_match',
]);

export const SHOULD_RELOGIN = new Set([
  'unauthorized',
  'session_expired',
]);
