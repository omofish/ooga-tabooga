// Core domain types for Poetry for Neanderthals

export type Phase =
  | "setup" // choosing teams + word set
  | "score" // the round x team scoreboard (also hosts the start-turn modal)
  | "countdown" // 3..2..1 before a turn
  | "play" // the 60s guessing turn
  | "review" // drag cards into +3 / +1 / -1 buckets
  | "reveal" // animated score total for the turn
  | "gameover"; // winner screen

/** A single game card: an easy one-point word and a hard three-point phrase. */
export type WordCard = { easy: string; hard: string };

/** Which bucket a resolved card ended up in. */
export type Bucket = "hard" | "easy" | "pass"; // +3 / +1 / -1

export const BUCKET_POINTS: Record<Bucket, number> = {
  hard: 3,
  easy: 1,
  pass: -1,
};

/** A card that was played during a turn, tagged with its outcome bucket. */
export type ResolvedCard = {
  id: number;
  card: WordCard;
  bucket: Bucket;
};

/** The finished result of one team's turn in one round. */
export type TurnResult = {
  playerName: string;
  cards: ResolvedCard[];
  score: number;
};

export type Team = {
  id: string; // "team-0"
  colorKey: string; // key into TEAM_COLORS
  name: string; // display name, e.g. "Red Rocks"
};

/** rounds[i] maps teamId -> that team's result for round i (undefined = not played yet). */
export type Round = Record<string, TurnResult | undefined>;

/** Everything about the turn currently being set up / played. */
export type ActiveTurn = {
  teamId: string;
  roundIndex: number;
  playerName: string;
  modalOpen: boolean; // name/confirm modal is showing over the scoreboard
  cursor: number; // next index to draw from the deck
  resolved: ResolvedCard[]; // cards already resolved this turn
  current: { card: WordCard; banked1: boolean } | null; // card in hand
  endsAt: number; // epoch ms the timer hits zero
  paused: boolean;
  remainingWhilePaused: number; // ms left, captured when paused
};

export type GameState = {
  version: number;
  phase: Phase;
  numTeams: number;
  wordSetId: string;
  teams: Team[];
  deck: WordCard[]; // shuffled cards for this game
  deckCursor: number; // shared pointer so turns don't repeat cards
  rounds: Round[];
  currentRound: number;
  active: ActiveTurn | null;
};
