"use client";

import { useEffect, useReducer, useState } from "react";
import {
  defaultState,
  loadState,
  reducer,
  saveState,
} from "@/lib/game";
import * as sound from "@/lib/sound";
import SetupScreen from "./SetupScreen";
import ScoreView from "./ScoreView";
import StartRoundModal from "./StartRoundModal";
import Countdown from "./Countdown";
import Gameplay from "./Gameplay";
import RoundReview from "./RoundReview";
import ScoreReveal from "./ScoreReveal";
import GameOver from "./GameOver";

export default function Game() {
  const [state, dispatch] = useReducer(reducer, undefined, defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Load any saved game from localStorage after mount. This one-time mount gate
  // is the intended pattern for reading client-only state without an SSR/
  // hydration mismatch, so the set-state-in-effect heuristic is expected here.
  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: "HYDRATE", state: saved });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Persist on every change once hydrated.
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  // A soft click on every button press, app-wide. One document-level listener
  // (fires for mouse, touch, and keyboard activation) keeps this out of every
  // component. Screens with their own richer sounds simply layer over it.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (el?.closest("button")) {
        sound.unlockAudio();
        sound.click();
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!hydrated) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center">
        <div className="font-display animate-wiggle text-5xl">🦴</div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col">
      {state.phase === "setup" && (
        <SetupScreen state={state} dispatch={dispatch} />
      )}

      {state.phase === "score" && <ScoreView state={state} dispatch={dispatch} />}

      {state.phase === "score" && state.active?.modalOpen && (
        <StartRoundModal state={state} dispatch={dispatch} />
      )}

      {state.phase === "countdown" && (
        <Countdown state={state} dispatch={dispatch} />
      )}

      {state.phase === "play" && <Gameplay state={state} dispatch={dispatch} />}

      {state.phase === "review" && (
        <RoundReview state={state} dispatch={dispatch} />
      )}

      {state.phase === "reveal" && (
        <ScoreReveal state={state} dispatch={dispatch} />
      )}

      {state.phase === "gameover" && (
        <GameOver state={state} dispatch={dispatch} />
      )}
    </main>
  );
}
