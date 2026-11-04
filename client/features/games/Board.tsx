import { SIZE, type Game, type Player } from "@shared/game/tictactoe";
import { cx } from "../../lib/cx";
import styles from "./Board.module.css";

/** X is a star, O is a planet. */
export function Mark({ player }: { player: Player }) {
  return <span className={styles[player]}>{player === "X" ? "✦" : "◯"}</span>;
}

const row = (cell: number) => Math.floor(cell / SIZE);
const col = (cell: number) => cell % SIZE;

/**
 * The 4×4 board. Pass `onPlay` to play on it; leave it out for a small,
 * read-only copy of a saved game. Its size comes from the width you give it.
 */
export function Board({
  game,
  onPlay,
  className,
}: {
  game: Game;
  onPlay?: (cell: number) => void;
  className?: string;
}) {
  const { line, result } = game;

  return (
    <div className={cx(styles.board, className)} aria-hidden={!onPlay}>
      {game.board.map((player, i) => {
        const cellClass = cx(styles.cell, line?.includes(i) && styles.win);
        const mark = player ? <Mark player={player} /> : null;

        return onPlay ? (
          <button
            key={i}
            type="button"
            className={cellClass}
            disabled={Boolean(player || result)}
            onClick={() => onPlay(i)}
            aria-label={`Row ${row(i) + 1}, column ${col(i) + 1}: ${player ?? "empty"}`}
          >
            {mark}
          </button>
        ) : (
          <span key={i} className={cellClass}>
            {mark}
          </span>
        );
      })}

      {/* The winning four, joined like a constellation. */}
      {line && result ? (
        <svg
          className={cx(styles.constellation, styles[result])}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          <line
            x1={col(line[0]) + 0.5}
            y1={row(line[0]) + 0.5}
            x2={col(line[SIZE - 1]) + 0.5}
            y2={row(line[SIZE - 1]) + 0.5}
          />
        </svg>
      ) : null}
    </div>
  );
}
