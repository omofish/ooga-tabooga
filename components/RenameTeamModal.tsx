"use client";

import { useState } from "react";
import type { Dispatch } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import { randomTribe } from "@/lib/tribes";
import type { Action } from "@/lib/game";
import type { Team } from "@/lib/types";
import Modal from "./Modal";

/** Grab the last whole emoji/grapheme the user typed, so the emoji field always
 *  holds a single character even when the keyboard sends extra keystrokes. */
function lastGrapheme(value: string): string {
  const s = value.trim();
  if (!s) return "";
  try {
    // Segmenter keeps ZWJ/flag emoji (👨‍👩‍👧, 🏴) as one unit.
    const Seg = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter })
      .Segmenter;
    if (Seg) {
      const parts = [...new Seg().segment(s)];
      return parts[parts.length - 1]?.segment ?? "";
    }
  } catch {
    // fall through to code-point split
  }
  const cps = [...s];
  return cps[cps.length - 1] ?? "";
}

/**
 * Rename a tribe and pick its emoji. Reuses the standard {@link Modal}. The 🎲
 * suggests a funny tribe name together with an on-theme emoji; the emoji is also
 * editable on its own via the square field next to the name.
 */
export default function RenameTeamModal({
  team,
  dispatch,
  onClose,
}: {
  team: Team;
  dispatch: Dispatch<Action>;
  onClose: () => void;
}) {
  const c = colorForKey(team.colorKey);
  const [draft, setDraft] = useState(team.name);
  // Default the emoji field to the team's own emoji, else its colour mascot.
  const [emoji, setEmoji] = useState(team.emoji || c.mascot);

  const roll = () => {
    const t = randomTribe();
    setDraft(t.name);
    setEmoji(t.emoji);
  };

  const save = () => {
    const name = draft.trim();
    const picked = emoji.trim() || c.mascot;
    if (name) {
      dispatch({ type: "SET_TEAM_NAME", teamId: team.id, name, emoji: picked });
    } else {
      // Blank name → roll a fresh funny tribe (name + emoji) as the default.
      const t = randomTribe();
      dispatch({ type: "SET_TEAM_NAME", teamId: team.id, name: t.name, emoji: t.emoji });
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} style={colorVars(c)} title="Rename tribe">
      <div className="text-center">
        <div className="animate-wiggle text-5xl">{emoji || c.mascot}</div>
        <p className="mt-1 text-xs font-extrabold uppercase tracking-widest text-ink-soft">
          Name your tribe
        </p>
      </div>

      <label className="mt-5 block text-sm font-extrabold text-ink-soft">
        What tribe called?
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          value={emoji}
          onChange={(e) => setEmoji(lastGrapheme(e.target.value))}
          aria-label="Tribe emoji"
          inputMode="text"
          className="chunk h-[52px] w-[52px] shrink-0 rounded-xl text-center text-2xl outline-none focus:translate-y-[-1px]"
          style={{ boxShadow: "0 4px 0 0 var(--color-ink)" }}
        />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={16}
          placeholder="Tribe name"
          className="chunk w-full rounded-xl px-3 py-3 text-lg font-extrabold text-ink outline-none focus:translate-y-[-1px]"
          style={{ boxShadow: "0 4px 0 0 var(--color-ink)" }}
        />
        <button
          onClick={roll}
          aria-label="Random tribe"
          className="btn btn-cream h-[52px] w-[52px] shrink-0 rounded-xl text-xl"
        >
          🎲
        </button>
      </div>
      <p className="mt-1.5 text-xs font-semibold text-ink-soft/80">
        Tap the emoji to change it, or 🎲 for a random tribe.
      </p>

      <button
        onClick={save}
        className="btn btn-team mt-6 w-full py-4 text-xl"
      >
        <span className="font-display">Save ✓</span>
      </button>
    </Modal>
  );
}
