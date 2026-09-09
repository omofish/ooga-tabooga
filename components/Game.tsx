"use client";

import { useEffect, useReducer, useState } from "react";
import {
  defaultState,
  loadState,
  reducer,
  saveState,
} from "@/lib/game";
import { colorForKey } from "@/lib/colors";
import * as sound from "@/lib/sound";
import TopBar from "./TopBar";
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

  // Client-side phase transitions don't trigger a real navigation, so the
  // browser never resets scroll on its own — without this, e.g. starting a
  // game while scrolled down on Setup lands the Score screen scrolled to
  // that same offset.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.phase]);

  // Match <body>'s own background to the current phase's theme colour. Every
  // phase's own div is already opaque and exactly viewport-sized, but an iOS
  // rubber-band overscroll bounce briefly reveals whatever's *behind* that
  // div — i.e. <body> itself — so leaving body on its default cream would
  // flash cream behind e.g. RoundReview's pink. Setting it here also gives
  // Safari's chrome-colour fallback sampling (see docs/architecture.md) the
  // right colour on the phases that render neither TopBar nor a bottom edge
  // element (setup/score deliberately have no bottom bar — see TopBar.tsx).
  useEffect(() => {
    const team = state.teams.find((t) => t.id === state.active?.teamId);
    const c = colorForKey(team?.colorKey ?? "red");
    const bg =
      state.phase === "countdown" ||
      state.phase === "play" ||
      state.phase === "reveal"
        ? c.base
        : state.phase === "review"
          ? c.soft
          : null;

    document.body.style.backgroundColor = bg ?? "";
    document.body.style.backgroundImage = bg ? "none" : "";

    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.backgroundImage = "";
    };
  }, [state.phase, state.active?.teamId, state.teams]);

  const showTopBar = state.phase === "setup" || state.phase === "score";

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col">
        <TopBar />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-wiggle text-5xl">🦴</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col">
      {showTopBar && <TopBar />}

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
