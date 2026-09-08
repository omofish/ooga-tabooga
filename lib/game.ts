import {
  BUCKET_POINTS,
  type ActiveTurn,
  type Bucket,
  type GameState,
  type ResolvedCard,
  type Round,
  type Team,
  type TurnResult,
  type WordCard,
} from "./types";
import { TEAM_COLORS } from "./colors";
import { randomCaveName } from "./names";
import { randomTribes } from "./tribes";
import { WORD_SETS, wordSetById } from "./word-sets";

export const STORAGE_KEY = "pfn-game-state-v1";
// v5: decks are now deduped by base word and reshuffle on exhaustion; discard
// any older persisted deck that predates that guarantee.
export const STATE_VERSION = 5;
export const TURN_SECONDS = 60; // default round length
export const TURN_OPTIONS = [60, 90, 120] as const;
export const MAX_TEAMS = 3;

export function defaultState(): GameState {
  return {
    version: STATE_VERSION,
    phase: "setup",
    numTeams: 2,
    wordSetId: WORD_SETS[0].id,
    turnSeconds: TURN_SECONDS,
    teams: [],
    deck: [],
    deckCursor: 0,
    rounds: [],
    currentRound: 0,
    active: null,
    seen: {},
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Stable identity for a card, used to remember which have been played. */
export function cardKey(c: WordCard): string {
  return `${c.easy}|${c.hard}`;
}

/** The base (+1) word of a card, normalised for uniqueness comparisons. */
function baseKey(c: WordCard): string {
  return c.easy.toLowerCase();
}

/**
 * Build a game deck that puts not-yet-seen cards (shuffled) first, then any
 * already-seen cards (shuffled) as a fallback, and then keeps only the first
 * card for each base (+1) word. This guarantees a fresh game exhausts every
 * unseen card before any repeat, and that **the same base word never comes up
 * twice until the whole deck has been dealt** (a card the source lists many
 * phrases for contributes exactly one card per cycle — a different phrase can
 * surface next game). Once every base has been dealt, `drawAt` reshuffles for
 * a fresh cycle. See docs/word-set-guidelines.md, "Base words must not repeat".
 */
function buildDeck(cards: WordCard[], seenKeys: string[]): WordCard[] {
  const seenSet = new Set(seenKeys);
  const unseen: WordCard[] = [];
  const seen: WordCard[] = [];
  for (const c of cards) (seenSet.has(cardKey(c)) ? seen : unseen).push(c);
  const ordered = [...shuffle(unseen), ...shuffle(seen)];
  const usedBase = new Set<string>();
  const deck: WordCard[] = [];
  for (const c of ordered) {
    const base = baseKey(c);
    if (usedBase.has(base)) continue;
    usedBase.add(base);
    deck.push(c);
  }
  return deck;
}

/** How many of a set's cards have been played (for the reset UI). */
export function seenCount(state: GameState, wordSetId: string): number {
  const set = new Set(state.seen[wordSetId] ?? []);
  const cards = wordSetById(wordSetId).cards;
  let n = 0;
  for (const c of cards) if (set.has(cardKey(c))) n++;
  return n;
}

function buildTeams(numTeams: number): Team[] {
  // Seed each new game with fresh random tribe names (+ matching emoji) from the
  // pool rather than always the fixed per-colour defaults. Players can still
  // rename via RenameTeamModal.
  const tribes = randomTribes(numTeams);
  return Array.from({ length: numTeams }, (_, i) => {
    const color = TEAM_COLORS[i];
    const tribe = tribes[i];
    return {
      id: `team-${i}`,
      colorKey: color.key,
      name: tribe.name,
      emoji: tribe.emoji,
    };
  });
}

/** A solo ("beat your best") game has a single tribe and no opponent. */
export function isSolo(state: GameState): boolean {
  return state.numTeams === 1;
}

/** True once every team has a recorded result for the current round. */
export function roundComplete(state: GameState): boolean {
  const round = state.rounds[state.currentRound];
  if (!round) return false;
  return state.teams.every((t) => round[t.id] !== undefined);
}

/** Aggregate a team's totals and per-turn breakdown across all rounds. */
export function teamSummary(state: GameState, teamId: string) {
  const turns: TurnResult[] = [];
  for (const round of state.rounds) {
    const r = round[teamId];
    if (r) turns.push(r);
  }
  const total = turns.reduce((sum, t) => sum + t.score, 0);
  return { total, turns };
}

/** Team next up to play, alternating through the roster; once every team has
 *  a result for the current round, loops back to the first team (a fresh
 *  round is created lazily by OPEN_MODAL). */
export function nextUpTeamId(state: GameState): string | null {
  if (state.teams.length === 0) return null;
  const round = state.rounds[state.currentRound];
  const waiting = state.teams.find((t) => !round?.[t.id]);
  return (waiting ?? state.teams[0]).id;
}

/** True once every team has played the same number of turns — the point at
 *  which it's fair to end the game. */
export function roundsBalanced(state: GameState): boolean {
  const counts = state.teams.map((t) => teamSummary(state, t.id).turns.length);
  return counts.every((c) => c === counts[0]);
}

export function scoreTurn(cards: ResolvedCard[]): number {
  return cards.reduce((sum, c) => sum + BUCKET_POINTS[c.bucket], 0);
}

// ---- Actions -------------------------------------------------------------

export type Action =
  | { type: "HYDRATE"; state: GameState }
  | { type: "SET_NUM_TEAMS"; n: number }
  | { type: "SET_TEAM_NAME"; teamId: string; name: string; emoji?: string }
  | { type: "SET_WORDSET"; id: string }
  | { type: "SET_TURN_SECONDS"; seconds: number }
  | { type: "START_GAME" }
  | { type: "OPEN_MODAL"; teamId: string }
  | { type: "SET_NAME"; name: string }
  | { type: "CLOSE_MODAL" }
  | { type: "START_TURN" } // modal -> countdown
  | { type: "COUNTDOWN_DONE" } // countdown -> play
  | { type: "PLUS_ONE" } // tap the +1 word (bank it)
  | { type: "NEXT_WORD" } // after banking, advance keeping +1
  | { type: "PLUS_THREE" } // tap the +3 phrase
  | { type: "PASS" } // pass / give up on this card
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESTART_TURN" } // pause menu: replay this player's turn from scratch
  | { type: "END_TURN" } // time up or "give up"
  | { type: "MOVE_CARD"; id: number; bucket: Bucket }
  | { type: "ADJUST_SCORE"; delta: number } // manual +/- tweak in review
  | { type: "CONFIRM_REVIEW" }
  | { type: "REVEAL_DONE" }
  | { type: "END_GAME" }
  | { type: "PLAY_AGAIN" }
  | { type: "RESET_WORDS" }
  | { type: "RETURN_TO_START" };

/**
 * Draw the card at `cursor`, returning the (possibly reshuffled) deck, the card,
 * and the next cursor. While the deck still has undealt cards this just walks
 * forward. Once it's exhausted — every base word has been dealt once — it
 * reshuffles for a fresh cycle instead of modulo-repeating the *identical*
 * order, and keeps the first card of the new cycle off the base just dealt so a
 * base never repeats back-to-back across the seam. This is what stops the same
 * +1 word reappearing across rounds in a long game.
 */
function drawAt(
  deck: WordCard[],
  cursor: number,
): { deck: WordCard[]; card: WordCard; cursor: number } {
  if (cursor < deck.length) {
    return { deck, card: deck[cursor], cursor: cursor + 1 };
  }
  const lastBase = baseKey(deck[deck.length - 1]);
  const reshuffled = shuffle(deck);
  if (reshuffled.length > 1 && baseKey(reshuffled[0]) === lastBase) {
    const swapWith = reshuffled.findIndex((c) => baseKey(c) !== lastBase);
    if (swapWith > 0) {
      [reshuffled[0], reshuffled[swapWith]] = [reshuffled[swapWith], reshuffled[0]];
    }
  }
  return { deck: reshuffled, card: reshuffled[0], cursor: 1 };
}

/** Resolve the current card into a bucket and draw the next one. */
function resolveAndDraw(
  active: ActiveTurn,
  deck: WordCard[],
  bucket: Bucket,
): { active: ActiveTurn; deck: WordCard[] } {
  if (!active.current) return { active, deck };
  const resolved: ResolvedCard[] = [
    ...active.resolved,
    { id: active.resolved.length, card: active.current.card, bucket },
  ];
  const drawn = drawAt(deck, active.cursor);
  return {
    deck: drawn.deck,
    active: {
      ...active,
      resolved,
      current: { card: drawn.card, banked1: false },
      cursor: drawn.cursor,
    },
  };
}

/** Finalise the in-hand card when a turn ends: keep a banked +1, drop the rest. */
function finalizeTurn(active: ActiveTurn): ResolvedCard[] {
  if (active.current?.banked1) {
    return [
      ...active.resolved,
      { id: active.resolved.length, card: active.current.card, bucket: "easy" },
    ];
  }
  return active.resolved;
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "SET_NUM_TEAMS":
      return { ...state, numTeams: Math.min(MAX_TEAMS, Math.max(1, action.n)) };

    case "SET_TEAM_NAME":
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.teamId
            ? {
                ...t,
                name: action.name,
                ...(action.emoji !== undefined ? { emoji: action.emoji } : {}),
              }
            : t,
        ),
      };

    case "SET_WORDSET":
      return { ...state, wordSetId: action.id };

    case "SET_TURN_SECONDS":
      return { ...state, turnSeconds: action.seconds };

    case "START_GAME": {
      const teams = buildTeams(state.numTeams);
      const deck = buildDeck(
        wordSetById(state.wordSetId).cards,
        state.seen[state.wordSetId] ?? [],
      );
      const firstRound: Round = {};
      return {
        ...state,
        phase: "score",
        teams,
        deck,
        deckCursor: 0,
        rounds: [firstRound],
        currentRound: 0,
        active: null,
      };
    }

    case "OPEN_MODAL": {
      // Teams alternate one at a time; once the current round has a result
      // for every team, this same tap starts the next round.
      const needsNewRound = roundComplete(state);
      const rounds = needsNewRound
        ? [...state.rounds, {} as Round]
        : state.rounds;
      const roundIndex = needsNewRound ? rounds.length - 1 : state.currentRound;
      const active: ActiveTurn = {
        teamId: action.teamId,
        roundIndex,
        playerName: "",
        modalOpen: true,
        cursor: state.deckCursor,
        resolved: [],
        current: null,
        endsAt: 0,
        paused: false,
        remainingWhilePaused: 0,
        scoreAdjust: 0,
      };
      return { ...state, rounds, currentRound: roundIndex, active };
    }

    case "SET_NAME":
      if (!state.active) return state;
      return { ...state, active: { ...state.active, playerName: action.name } };

    case "CLOSE_MODAL":
      return { ...state, active: null };

    case "START_TURN": {
      if (!state.active) return state;
      const name = state.active.playerName.trim() || randomCaveName();
      return {
        ...state,
        phase: "countdown",
        active: {
          ...state.active,
          playerName: name,
          modalOpen: false,
          cursor: state.deckCursor,
          resolved: [],
          current: null,
        },
      };
    }

    case "COUNTDOWN_DONE": {
      if (!state.active) return state;
      const drawn = drawAt(state.deck, state.active.cursor);
      return {
        ...state,
        phase: "play",
        deck: drawn.deck,
        active: {
          ...state.active,
          current: { card: drawn.card, banked1: false },
          cursor: drawn.cursor,
          endsAt: Date.now() + state.turnSeconds * 1000,
          paused: false,
        },
      };
    }

    case "PLUS_ONE": {
      if (!state.active?.current || state.active.current.banked1) return state;
      return {
        ...state,
        active: {
          ...state.active,
          current: { ...state.active.current, banked1: true },
        },
      };
    }

    case "NEXT_WORD": {
      // Only reachable once +1 is banked; keep the +1 and move on.
      if (!state.active?.current) return state;
      const { active, deck } = resolveAndDraw(state.active, state.deck, "easy");
      return { ...state, active, deck };
    }

    case "PLUS_THREE": {
      if (!state.active?.current) return state;
      const { active, deck } = resolveAndDraw(state.active, state.deck, "hard");
      return { ...state, active, deck };
    }

    case "PASS": {
      if (!state.active?.current) return state;
      const bucket: Bucket = state.active.current.banked1 ? "easy" : "pass";
      const { active, deck } = resolveAndDraw(state.active, state.deck, bucket);
      return { ...state, active, deck };
    }

    case "PAUSE": {
      if (!state.active || state.active.paused) return state;
      const remaining = Math.max(0, state.active.endsAt - Date.now());
      return {
        ...state,
        active: { ...state.active, paused: true, remainingWhilePaused: remaining },
      };
    }

    case "RESUME": {
      if (!state.active || !state.active.paused) return state;
      return {
        ...state,
        active: {
          ...state.active,
          paused: false,
          endsAt: Date.now() + state.active.remainingWhilePaused,
        },
      };
    }

    case "RESTART_TURN": {
      // Replay the current player's turn: drop any resolved cards and run the
      // countdown again with a fresh clock. The deck cursor is left where it is
      // (not rewound to the turn's start) so the replay deals a *different* set
      // of cards rather than repeating the same ones.
      if (!state.active) return state;
      return {
        ...state,
        phase: "countdown",
        active: {
          ...state.active,
          modalOpen: false,
          resolved: [],
          current: null,
          paused: false,
          remainingWhilePaused: 0,
          endsAt: 0,
        },
      };
    }

    case "END_TURN": {
      if (!state.active) return state;
      const resolved = finalizeTurn(state.active);
      return {
        ...state,
        phase: "review",
        active: { ...state.active, resolved, current: null, paused: false },
      };
    }

    case "MOVE_CARD": {
      if (!state.active) return state;
      const resolved = state.active.resolved.map((c) =>
        c.id === action.id ? { ...c, bucket: action.bucket } : c,
      );
      return { ...state, active: { ...state.active, resolved } };
    }

    case "ADJUST_SCORE": {
      if (!state.active) return state;
      return {
        ...state,
        active: {
          ...state.active,
          scoreAdjust: (state.active.scoreAdjust ?? 0) + action.delta,
        },
      };
    }

    case "CONFIRM_REVIEW": {
      if (!state.active) return state;
      const { teamId, roundIndex, playerName, resolved, cursor, scoreAdjust } =
        state.active;
      const result: TurnResult = {
        playerName,
        cards: resolved,
        score: scoreTurn(resolved) + (scoreAdjust ?? 0),
      };
      const rounds = state.rounds.map((r, i) =>
        i === roundIndex ? { ...r, [teamId]: result } : r,
      );
      // Remember every card played this turn so it won't come back next game.
      const prevSeen = state.seen[state.wordSetId] ?? [];
      const merged = new Set(prevSeen);
      for (const rc of resolved) merged.add(cardKey(rc.card));
      const seen = { ...state.seen, [state.wordSetId]: [...merged] };
      return {
        ...state,
        phase: "reveal",
        rounds,
        deckCursor: cursor,
        seen,
      };
    }

    case "REVEAL_DONE":
      return { ...state, phase: "score", active: null };

    case "END_GAME":
      return { ...state, phase: "gameover", active: null };

    case "PLAY_AGAIN": {
      const deck = buildDeck(
        wordSetById(state.wordSetId).cards,
        state.seen[state.wordSetId] ?? [],
      );
      return {
        ...state,
        phase: "score",
        deck,
        deckCursor: 0,
        rounds: [{}],
        currentRound: 0,
        active: null,
      };
    }

    case "RESET_WORDS":
      return { ...state, seen: {} };

    case "RETURN_TO_START":
      // Keep the word memory so "new game" still avoids recently seen cards, and
      // preserve the player's setup choices (tribe count / round length / word
      // set) so the setup screen re-opens with what they last played.
      return {
        ...defaultState(),
        seen: state.seen,
        numTeams: state.numTeams,
        turnSeconds: state.turnSeconds,
        wordSetId: state.wordSetId,
      };

    default:
      return state;
  }
}

// ---- Persistence ---------------------------------------------------------

export function loadState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== STATE_VERSION) return null;
    if (!parsed.seen) parsed.seen = {};
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private-mode errors
  }
}
