import { z } from "zod";
import { SIZE, type Result } from "../game/tictactoe";

/** What the browser sends to save a game: only the moves, never the result. */
export const saveGameSchema = z.object({
  moves: z
    .array(
      z
        .int("Every move must be a cell number")
        .min(0, "There is a move outside the board")
        .max(SIZE * SIZE - 1, "There is a move outside the board"),
    )
    .max(SIZE * SIZE, "There are more moves than cells"),
});

/** A saved game, as the API returns it. */
export type SavedGame = {
  id: string;
  moves: number[];
  result: Result;
  created_at: string;
};
