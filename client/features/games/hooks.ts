import type { SavedGame } from "@shared/schemas/games";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

/* Talking to /api/games from the browser. Same pattern as features/events. */

const gamesKey = ["games"];

/** The logged-in user's saved games, newest first. */
export function useGames() {
  return useQuery({
    queryKey: gamesKey,
    queryFn: () => api<SavedGame[]>("/api/games"),
  });
}

/** Sends the moves of a finished game. The server works out the result. */
export function useSaveGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moves: number[]) =>
      api<SavedGame>("/api/games", { method: "POST", body: { moves } }),
    onSuccess: () => {
      // The list is now out of date - fetch it again.
      void queryClient.invalidateQueries({ queryKey: gamesKey });
    },
  });
}
