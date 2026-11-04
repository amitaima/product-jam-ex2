import { newGame, play, replay, type Result } from "@shared/game/tictactoe";
import { useState } from "react";
import { Button, Card, Spinner } from "../../components";
import { formatEventDate } from "../../features/events/dates";
import { Board, Mark } from "../../features/games/Board";
import { useGames, useSaveGame } from "../../features/games/hooks";
import { LANG } from "../../lib/config";
import { cx } from "../../lib/cx";
import sky from "../../styles/sky.module.css";
import styles from "./TicTacToePage.module.css";

/** Two players on one screen. The rules live in shared/game/tictactoe.ts. */
export default function TicTacToePage() {
  const [game, setGame] = useState(newGame);
  const saveGame = useSaveGame();
  const gamesQuery = useGames();

  function handlePlay(cell: number) {
    const next = play(game, cell);
    // The board only lets you click empty cells, so this is never an error.
    if (typeof next === "string") return;
    setGame(next);
    if (next.result) saveGame.mutate(next.moves);
  }

  function handleNewGame() {
    setGame(newGame());
    saveGame.reset();
  }

  return (
    <main className={cx(sky.sky, styles.page)}>
      <h1>Four in a row</h1>

      <p className={styles.status} aria-live="polite">
        {game.result ? (
          <Outcome result={game.result} />
        ) : (
          <>
            <Mark player={game.turn} /> {game.turn}&apos;s turn
          </>
        )}
      </p>

      <Board game={game} onPlay={handlePlay} className={styles.board} />

      <div className={styles.actions}>
        <Button onClick={handleNewGame}>New game</Button>
        {saveGame.isPending ? (
          <span className={styles.muted}>
            <Spinner size="sm" label="Saving" /> Saving the game...
          </span>
        ) : saveGame.isError ? (
          <span role="alert" className={styles.error}>
            Could not save the game: {saveGame.error.message}{" "}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveGame.mutate(game.moves)}
            >
              Try again
            </Button>
          </span>
        ) : saveGame.isSuccess ? (
          <span className={styles.muted}>Saved ✓</span>
        ) : null}
      </div>

      <h2 className={styles.historyTitle}>Your games</h2>
      {gamesQuery.isPending ? (
        <Spinner />
      ) : gamesQuery.isError ? (
        <Card>
          <p role="alert">Could not load your games.</p>
          <Button variant="secondary" onClick={() => void gamesQuery.refetch()}>
            Try again
          </Button>
        </Card>
      ) : gamesQuery.data.length === 0 ? (
        <p className={styles.muted}>
          No games yet. Finish one and it lands here.
        </p>
      ) : (
        <ul className={styles.history}>
          {gamesQuery.data.map((saved) => {
            const replayed = replay(saved.moves);
            return (
              <li key={saved.id} className={styles.item}>
                {typeof replayed === "string" ? null : (
                  <Board game={replayed} className={styles.mini} />
                )}
                <div>
                  <Outcome result={saved.result} />
                  <p className={styles.muted}>
                    {formatEventDate(saved.created_at, LANG)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function Outcome({ result }: { result: Result }) {
  if (result === "draw") return <>Draw, the sky is full</>;
  return (
    <>
      <Mark player={result} /> {result} wins!
    </>
  );
}
