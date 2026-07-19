// Solo ("beat your best") records. In a 1-tribe game there's no opponent, so the
// thing you play against is your own best **single turn**. We track the highest
// single-turn score for each (word set × round length) combo — a fair, bounded
// comparison, since a 120s turn naturally outscores a 60s one and different sets
// vary in difficulty.
//
// Stored under its own localStorage key, separate from the game state (like the
// mute flag), so records survive new games and "return to start". The reducer
// stays pure — writes happen from a component effect, never in `lib/game.ts`.

export type BestTurn = { score: number; name: string };
export type BestTurns = Record<string, BestTurn>;

export const BEST_TURN_KEY = "pfn-best-turn-v1";

/** Records are scoped per word set AND round length. */
function keyFor(wordSetId: string, turnSeconds: number): string {
  return `${wordSetId}:${turnSeconds}`;
}

function loadAll(): BestTurns {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BEST_TURN_KEY);
    return raw ? (JSON.parse(raw) as BestTurns) : {};
  } catch {
    return {};
  }
}

/** The stored best turn for this combo, or null if none has been set yet. */
export function bestTurn(
  wordSetId: string,
  turnSeconds: number,
): BestTurn | null {
  return loadAll()[keyFor(wordSetId, turnSeconds)] ?? null;
}

/**
 * Record `score` as the new best for this combo if it strictly beats the stored
 * one. Returns the new record when it was beaten (so the caller can celebrate),
 * else null. Only positive scores are ever recorded, so an all-pass turn never
 * seeds a negative "best".
 */
export function recordBestTurn(
  wordSetId: string,
  turnSeconds: number,
  score: number,
  name: string,
): BestTurn | null {
  if (typeof window === "undefined" || score <= 0) return null;
  const all = loadAll();
  const k = keyFor(wordSetId, turnSeconds);
  const prev = all[k];
  if (prev && score <= prev.score) return null;
  const next: BestTurn = { score, name };
  all[k] = next;
  try {
    window.localStorage.setItem(BEST_TURN_KEY, JSON.stringify(all));
  } catch {
    // ignore quota / private-mode errors
  }
  return next;
}
