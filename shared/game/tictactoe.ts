/*
 * The rules of tic-tac-toe, variant "four": a 4×4 board, four in a row wins.
 *
 * Pure functions: no React and no database. The page plays with them, and
 * the server replays every game it saves with the same ones.
 *
 * Cells are numbered 0-15, row by row. X always plays first.
 */

export const SIZE = 4;

export type Player = "X" | "O";
export type Result = Player | "draw";

export type Game = {
  board: (Player | null)[];
  /** The cells played so far, in order. */
  moves: number[];
  turn: Player;
  /** null while the game is still on. */
  result: Result | null;
  /** The four winning cells, if someone won. */
  line: number[] | null;
};

/** Every way a move can be wrong. */
export type MoveError = "game_over" | "off_board" | "cell_taken";

const STEPS = [0, 1, 2, 3];

/** Every four in a row: 4 rows, 4 columns and the 2 diagonals. */
const LINES = [
  ...STEPS.map((row) => STEPS.map((col) => row * SIZE + col)),
  ...STEPS.map((col) => STEPS.map((row) => row * SIZE + col)),
  STEPS.map((i) => i * SIZE + i),
  STEPS.map((i) => i * SIZE + (SIZE - 1 - i)),
];

export function newGame(): Game {
  return {
    board: Array(SIZE * SIZE).fill(null),
    moves: [],
    turn: "X",
    result: null,
    line: null,
  };
}

/** The game after the player whose turn it is plays `cell`. Never changes `game`. */
export function play(game: Game, cell: number): Game | MoveError {
  if (game.result) return "game_over";
  if (!Number.isInteger(cell) || cell < 0 || cell >= game.board.length) {
    return "off_board";
  }
  if (game.board[cell]) return "cell_taken";

  const board = game.board.map((mark, i) => (i === cell ? game.turn : mark));
  const line =
    LINES.find((cells) => cells.every((i) => board[i] === game.turn)) ?? null;

  return {
    board,
    moves: [...game.moves, cell],
    turn: game.turn === "X" ? "O" : "X",
    result: line ? game.turn : board.includes(null) ? null : "draw",
    line,
  };
}

/** Plays `moves` from an empty board, and stops at the first wrong one. */
export function replay(moves: number[]): Game | MoveError {
  let game = newGame();
  for (const cell of moves) {
    const next = play(game, cell);
    if (typeof next === "string") return next;
    game = next;
  }
  return game;
}
