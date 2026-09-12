"use client";

import { MAX_TEAMS, TURN_OPTIONS, seenCount } from "@/lib/game";
import { TEAM_COLORS } from "@/lib/colors";
import { bestTurn } from "@/lib/solo";
import { unlockAudio } from "@/lib/sound";
import { WORD_SETS, wordSetById } from "@/lib/word-sets";
import ShareButton from "./ShareButton";
import type { ScreenProps } from "./types";

const TEAM_OPTIONS = Array.from(
  { length: MAX_TEAMS },
  (_, i) => i + 1,
); // [1, 2, 3] — 1 is solo "beat your best" mode

export default function SetupScreen({ state, dispatch }: ScreenProps) {
  const seen = seenCount(state, state.wordSetId);
  const total = wordSetById(state.wordSetId).cards.length;
  // Safe to read localStorage during render: <Game/> only mounts this screen
  // after its hydration gate, so there's no SSR mismatch.
  const solo = state.numTeams === 1;
  const best = solo ? bestTurn(state.wordSetId, state.turnSeconds) : null;

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
          {solo && best && (
            <p className="mt-2 px-1 text-xs font-bold text-ink-soft">
              Best: {best.score} ({best.name}).
            </p>
          )}
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

        {/* Word set */}
        <section>
          <h2 className="font-display mb-2 text-xl text-ink">Pick your words</h2>
          <div className="flex flex-col gap-3">
            {WORD_SETS.map((set) => {
              const selected = state.wordSetId === set.id;
              return (
                <button
                  key={set.id}
                  onClick={() => dispatch({ type: "SET_WORDSET", id: set.id })}
                  className={`btn ${selected ? "btn-ink" : "btn-cream"} flex items-center gap-3 px-4 py-3 text-left`}
                >
                  <span className="text-3xl">{set.emoji}</span>
                  <span className="flex flex-col">
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

          {/* Word memory: how many of this set have been shown, with a reset. */}
          <div className="mt-3 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-bold text-ink-soft">
              🧠 Seen {seen} of {total} words
            </p>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Forget which words have been shown? They may start repeating.",
                  )
                ) {
                  dispatch({ type: "RESET_WORDS" });
                }
              }}
              disabled={seen === 0}
              className="btn btn-cream px-3 py-2 text-xs"
            >
              ♻︎ Reset Words
            </button>
          </div>
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
