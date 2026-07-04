import type { Dispatch } from "react";
import type { Action } from "@/lib/game";
import type { GameState } from "@/lib/types";

export type ScreenProps = {
  state: GameState;
  dispatch: Dispatch<Action>;
};
