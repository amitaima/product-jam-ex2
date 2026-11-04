import type { Explanation, Picture } from "@shared/schemas/nasa";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

/* Talking to /api/nasa from the browser. Same pattern as features/events. */

/** Up to 10 random APOD pictures. `refetch()` gets a new random set. */
export function usePictures() {
  return useQuery({
    queryKey: ["nasa", "pictures"],
    queryFn: () => api<Picture[]>("/api/nasa/pictures"),
    // NASA is slow when it fails, so show the error instead of waiting twice.
    retry: false,
  });
}

/** Asks for one picture to be explained in Hebrew. Sends only its date. */
export function useExplain() {
  return useMutation({
    mutationFn: (date: string) =>
      api<Explanation>("/api/nasa/explanations", {
        method: "POST",
        body: { date },
      }),
  });
}
