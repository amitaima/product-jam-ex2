import { replay } from "@shared/game/tictactoe";
import { saveGameSchema } from "@shared/schemas/games";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { fail, validate } from "../lib/errors";
import { createAdminClient } from "../lib/supabase";

/*
 * Tic-tac-toe games. A game belongs to the user who saved it, so every query
 * is filtered by `c.get("user").id`.
 */

const COLUMNS = "id, moves, result, created_at";

/** Why a list of moves could not have been played, for people. */
const PROBLEMS = {
  game_over: "There is a move after the game ended.",
  off_board: "There is a move outside the board.",
  cell_taken: "The same cell was played twice.",
};

export const games = new Hono<AppEnv>()

  // GET /api/games - the logged-in user's games, newest first.
  .get("/", async (c) => {
    const { data, error } = await createAdminClient(c.env)
      .from("games")
      .select(COLUMNS)
      .eq("owner_id", c.get("user").id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("list games failed:", error);
      return fail(c, 500, "database_error", "Could not load your games.");
    }
    return c.json(data);
  })

  // POST /api/games - save a finished game. The browser sends only the
  // moves: the server replays them, and saves the result IT calculated.
  .post("/", validate("json", saveGameSchema), async (c) => {
    const { moves } = c.req.valid("json");

    const game = replay(moves);
    if (typeof game === "string") {
      return fail(c, 422, "impossible_game", PROBLEMS[game]);
    }
    if (!game.result) {
      return fail(c, 422, "unfinished_game", "This game has not ended yet.");
    }

    const { data, error } = await createAdminClient(c.env)
      .from("games")
      .insert({ owner_id: c.get("user").id, moves, result: game.result })
      .select(COLUMNS)
      .single();

    if (error) {
      console.error("save game failed:", error);
      return fail(c, 500, "database_error", "Could not save the game.");
    }
    return c.json(data, 201);
  });
