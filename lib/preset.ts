import { CHALLENGE_MODES, MAX_TEAMS, TURN_OPTIONS } from "./game";
import type { GameState } from "./types";
import { WORD_SETS } from "./word-sets";

/** Setup choices that can ride along in a shared link, e.g.
 *  `?pack=movies&mode=speed&time=90&tribes=2`. Every field is optional. */
export type Preset = {
  wordSetId?: string;
  challengeMode?: string;
  turnSeconds?: number;
  numTeams?: number;
};

const PARAMS = { pack: "pack", mode: "mode", time: "time", tribes: "tribes" };

/** Reads a preset from a query string. Each param is checked on its own
 *  against the real option lists, so one bad value doesn't spoil the rest. */
export function parsePreset(search: string): Preset {
  const q = new URLSearchParams(search);
  const preset: Preset = {};

  const pack = q.get(PARAMS.pack);
  if (pack && WORD_SETS.some((s) => s.id === pack)) preset.wordSetId = pack;

  const mode = q.get(PARAMS.mode);
  if (mode && CHALLENGE_MODES.some((m) => m.id === mode)) {
    preset.challengeMode = mode;
  }

  const time = Number(q.get(PARAMS.time));
  if ((TURN_OPTIONS as readonly number[]).includes(time)) {
    preset.turnSeconds = time;
  }

  const tribes = Number(q.get(PARAMS.tribes));
  if (Number.isInteger(tribes) && tribes >= 1 && tribes <= MAX_TEAMS) {
    preset.numTeams = tribes;
  }

  return preset;
}

export function isEmptyPreset(preset: Preset): boolean {
  return Object.keys(preset).length === 0;
}

/** Writes the current setup into `url`'s query string. */
export function addPresetParams(url: URL, state: GameState): void {
  url.searchParams.set(PARAMS.pack, state.wordSetId);
  url.searchParams.set(PARAMS.mode, state.challengeMode);
  url.searchParams.set(PARAMS.time, String(state.turnSeconds));
  url.searchParams.set(PARAMS.tribes, String(state.numTeams));
}

/** Removes the preset params from the address bar (keeps any others, e.g.
 *  utm_*), so a reload doesn't re-apply the link over later changes. */
export function stripPresetParams(): void {
  const url = new URL(window.location.href);
  const before = url.search;
  for (const p of Object.values(PARAMS)) url.searchParams.delete(p);
  if (url.search !== before) window.history.replaceState(null, "", url);
}
