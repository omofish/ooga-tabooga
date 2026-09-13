"use client";

import { useState } from "react";
import { CHALLENGE_MODES, MAX_TEAMS, TURN_OPTIONS, seenCount } from "@/lib/game";
import { TEAM_COLORS } from "@/lib/colors";
import { unlockAudio } from "@/lib/sound";
import { WORD_SETS, wordSetById } from "@/lib/word-sets";
import AddToHomeScreen from "./AddToHomeScreen";
import Modal from "./Modal";
import ShareButton from "./ShareButton";
import type { ScreenProps } from "./types";

const TEAM_OPTIONS = Array.from(
  { length: MAX_TEAMS },
  (_, i) => i + 1,
); // [1, 2, 3] — 1 is solo "beat your best" mode

export default function SetupScreen({ state, dispatch }: ScreenProps) {
  const seen = seenCount(state, state.wordSetId);
  const wordSet = wordSetById(state.wordSetId);
  const total = wordSet.cards.length;
  const [resetOpen, setResetOpen] = useState(false);
  const [modesOpen, setModesOpen] = useState(false);
  const [packPickerOpen, setPackPickerOpen] = useState(false);

  return (
    // No background of its own — deliberately left transparent so <body>'s
    // own colour + polka-dot texture (globals.css) shows through.
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-7 px-5 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-6">
        {/* Team count */}
        <section>
          <h2 className="font-display mb-2 text-xl text-ink">How many tribes?</h2>
          <div className="grid grid-cols-3 gap-3">
            {TEAM_OPTIONS.map((n) => {
              const selected = state.numTeams === n;
              return (
                <button
                  key={n}
                  onClick={() => dispatch({ type: "SET_NUM_TEAMS", n })}
                  className={`btn ${selected ? "btn-ink" : "btn-cream"} flex flex-col items-center gap-1 py-4`}
                >
                  <span className="font-display text-3xl">{n}</span>
                  <span className="flex gap-1">
                    {TEAM_COLORS.slice(0, n).map((c) => (
                      <span
                        key={c.key}
                        className="h-3 w-3 rounded-full border-2 border-ink"
                        style={{ background: c.base }}
                      />
                    ))}
                  </span>
                  <span className="text-xs font-bold opacity-80">
                    {n === 1 ? "solo" : "tribes"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Round length */}
        <section>
          <h2 className="font-display mb-2 text-xl text-ink">Round length</h2>
          <div className="grid grid-cols-3 gap-3">
            {TURN_OPTIONS.map((sec) => {
              const selected = state.turnSeconds === sec;
              return (
                <button
                  key={sec}
                  onClick={() =>
                    dispatch({ type: "SET_TURN_SECONDS", seconds: sec })
                  }
                  className={`btn ${selected ? "btn-ink" : "btn-cream"} flex flex-col items-center gap-0.5 py-4`}
                >
                  <span className="font-display text-3xl">{sec}</span>
                  <span className="text-xs font-bold opacity-80">seconds</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Word set: shows only the current pick — with this many packs now,
            listing them all inline pushed everything else down the page.
            Tapping it opens a picker Modal with the full list instead. */}
        <section>
          <h2 className="font-display mb-2 text-xl text-ink">Pick your words</h2>
          <button
            onClick={() => setPackPickerOpen(true)}
            className="btn btn-cream flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <span className="text-3xl">{wordSet.emoji}</span>
            <span className="flex flex-col justify-center gap-0.5 self-center">
              <span className="font-display text-lg leading-tight">
                {wordSet.name}
              </span>
              <span className="text-xs font-semibold opacity-80">
                {wordSet.blurb}
              </span>
            </span>
            <span className="ml-auto text-2xl text-ink-soft">›</span>
          </button>

          {packPickerOpen && (
            <Modal onClose={() => setPackPickerOpen(false)} title="Pick your words">
              <div className="text-center">
                <div className="text-5xl">🎯</div>
                <h2 className="mt-1 font-display text-2xl text-ink">
                  Pick Your Words
                </h2>
              </div>
              <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-4">
                {WORD_SETS.map((set) => {
                  const selected = state.wordSetId === set.id;
                  return (
                    <button
                      key={set.id}
                      onClick={() => {
                        dispatch({ type: "SET_WORDSET", id: set.id });
                        setPackPickerOpen(false);
                      }}
                      className={`btn ${selected ? "btn-ink" : "btn-cream"} flex items-center gap-3 px-4 py-3 text-left`}
                    >
                      <span className="text-3xl">{set.emoji}</span>
                      <span className="flex flex-col justify-center gap-0.5 self-center">
                        <span className="font-display text-lg leading-tight">
                          {set.name}
                        </span>
                        <span className="text-xs font-semibold opacity-80">
                          {set.blurb}
                        </span>
                      </span>
                      {selected && <span className="ml-auto text-xl">✓</span>}
                    </button>
                  );
                })}
              </div>
            </Modal>
          )}

          {/* Word memory: how many of this set have been shown, with a reset. */}
          <div className="mt-3 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-bold text-ink-soft">
              🧠 Seen {seen} of {total} words
            </p>
            <button
              onClick={() => setResetOpen(true)}
              disabled={seen === 0}
              className="btn btn-cream px-3 py-2 text-xs"
            >
              ♻︎ Reset Words
            </button>
          </div>

          {resetOpen && (
            <Modal onClose={() => setResetOpen(false)} title="Reset words">
              <div className="text-center">
                <div className="text-5xl">♻︎</div>
                <h2 className="mt-1 font-display text-2xl text-ink">
                  Reset {wordSet.name} words?
                </h2>
                <p className="mt-2 text-sm font-bold text-ink-soft">
                  Forget which {wordSet.name} words have been shown. They may
                  start repeating. Other packs aren&apos;t affected.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setResetOpen(false)}
                  className="btn btn-cream py-3 text-lg"
                >
                  <span className="font-display">Cancel</span>
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: "RESET_WORDS" });
                    setResetOpen(false);
                  }}
                  className="btn btn-ink py-3 text-lg"
                >
                  <span className="font-display">Reset</span>
                </button>
              </div>
            </Modal>
          )}
        </section>

        {/* More game modes: optional house rules, collapsed by default so the
            default flow stays simple. Mutually exclusive — picking one
            deselects any other. Closing the section clears whatever was
            picked (it doesn't come back just from reopening). */}
        <section>
          <button
            onClick={() => {
              const next = !modesOpen;
              if (!next) dispatch({ type: "SET_CHALLENGE_MODE", mode: null });
              setModesOpen(next);
            }}
            className="mb-2 flex w-full items-center gap-2 text-left"
          >
            <span
              className={`inline-block text-4xl text-ink-soft transition-transform ${modesOpen ? "rotate-90" : ""}`}
            >
              ▸
            </span>
            <h2 className="font-display text-xl text-ink">More Game Modes</h2>
          </button>

          {modesOpen && (
            <div className="flex flex-col gap-3">
              {CHALLENGE_MODES.map((mode) => {
                const selected = state.challengeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() =>
                      dispatch({
                        type: "SET_CHALLENGE_MODE",
                        mode: selected ? null : mode.id,
                      })
                    }
                    className={`btn ${selected ? "btn-ink" : "btn-cream"} flex items-center gap-3 px-4 py-3 text-left`}
                  >
                    <span className="text-3xl">{mode.emoji}</span>
                    <span className="flex flex-col justify-center gap-0.5 self-center">
                      <span className="font-display text-lg leading-tight">
                        {mode.name}
                      </span>
                      <span className="text-xs font-semibold opacity-80">
                        {mode.blurb}
                      </span>
                    </span>
                    {selected && <span className="ml-auto text-xl">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={() => {
              unlockAudio();
              dispatch({ type: "START_GAME" });
            }}
            className="btn btn-team py-5 text-2xl"
            style={{
              // Setup uses the first team's colour as a friendly accent.
              ["--team-base" as string]: TEAM_COLORS[0].base,
              ["--team-on" as string]: TEAM_COLORS[0].onBase,
            }}
          >
            <span className="font-display">Start Game 🔥</span>
          </button>

          <ShareButton />
          <AddToHomeScreen />
        </div>

        {/* Build hash + contact: normal in-flow content, not pinned — lets a
            deployed GitHub Pages build be checked against the commit that
            produced it. Hash baked in at build time via next.config.ts. */}
        <footer className="text-center">
          <p className="text-xs font-bold text-ink-soft/60">
            build {process.env.NEXT_PUBLIC_COMMIT_HASH}
          </p>
          <p className="text-xs font-bold text-ink-soft/60">
            Drop mail to{" "}
            <a
              href="https://t.me/omofish"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2"
            >
              @omofish
            </a>{" "}
            if have back to feed
          </p>
        </footer>
      </div>
    </div>
  );
}
