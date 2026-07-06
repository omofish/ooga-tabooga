"use client";

import { useState } from "react";
import type { Dispatch } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import { randomCaveName } from "@/lib/names";
import type { Action } from "@/lib/game";
import type { Team } from "@/lib/types";
import Modal from "./Modal";

/**
 * Rename a tribe. Reuses the standard {@link Modal} and mirrors the name/dice
 * pattern from {@link StartRoundModal}: an editable field seeded with the
 * current name plus a 🎲 that drops in a random caveman name.
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

  const save = () => {
    dispatch({
      type: "SET_TEAM_NAME",
      teamId: team.id,
      name: draft.trim() || randomCaveName(),
    });
    onClose();
  };

  return (
    <Modal onClose={onClose} style={colorVars(c)}>
      <div className="text-center">
        <div className="animate-wiggle text-5xl">{c.mascot}</div>
        <p className="mt-1 text-xs font-extrabold uppercase tracking-widest text-ink-soft">
          Name your tribe
        </p>
      </div>

      <label className="mt-5 block text-sm font-extrabold text-ink-soft">
        What tribe called?
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={16}
          placeholder="Tribe name"
          className="chunk w-full rounded-xl px-3 py-3 text-lg font-extrabold text-ink outline-none focus:translate-y-[-1px]"
          style={{ boxShadow: "0 4px 0 0 var(--color-ink)" }}
        />
        <button
          onClick={() => setDraft(randomCaveName())}
          aria-label="Random name"
          className="btn btn-cream h-[52px] w-[52px] shrink-0 rounded-xl text-xl"
        >
          🎲
        </button>
      </div>

      <button
        onClick={save}
        className="btn btn-team mt-6 w-full py-4 font-display text-xl"
      >
        Save ✓
      </button>
    </Modal>
  );
}
