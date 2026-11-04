# Design

The plan for parts 1 and 2: the tables I add, and the endpoints the browser
uses. Every table has Row Level Security on with no policies, like `events`. All
access goes through the server, and every endpoint below needs a login.

## The database

**Table `games`** - one row per finished tic-tac-toe game (variant `four`: 4×4
board, four in a row wins).

| Column       | Type          | Rules                                                    |
| ------------ | ------------- | -------------------------------------------------------- |
| `id`         | `uuid`        | primary key                                              |
| `owner_id`   | `uuid`        | foreign key to `auth.users`, not null, on delete cascade |
| `moves`      | `jsonb`       | not null, an array of 7 to 16 cell numbers (0-15)        |
| `result`     | `text`        | not null, one of `X`, `O`, `draw`                        |
| `created_at` | `timestamptz` | not null, set by the database                            |

- `moves` is the list of cells in the order they were played, X first. Cells are
  numbered 0-15, row by row. The shortest finished game is 7 moves (X plays 4, O
  plays 3), and the longest is 16.
- `result` is the result the **server** calculated by replaying `moves`, never
  one sent by the browser.
- Index on `(owner_id, created_at desc)`, for "my games, newest first".

**Table `apod_explanations`** - one row per APOD picture that Gemini explained
in Hebrew. It is a cache: shared by all users, so nobody pays twice for the same
picture.

| Column       | Type          | Rules                                    |
| ------------ | ------------- | ---------------------------------------- |
| `date`       | `date`        | primary key (APOD has one picture a day) |
| `title_he`   | `text`        | not null                                 |
| `summary_he` | `text`        | not null                                 |
| `tags`       | `text[]`      | not null, 1 to 5 tags                    |
| `created_at` | `timestamptz` | not null, set by the database            |

- The tags come from a fixed list in `shared/schemas/nasa.ts`. Zod checks that
  every tag is on the list before the row is saved.
- There is no `owner_id`: an explanation belongs to the picture, not to the user
  who asked first.

## The API

### Part 1 - Tic-tac-toe

**`POST /api/games`** - save a finished game.

- Receives: `{ moves }`, the list of cells played, for example
  `{ "moves": [0, 4, 1, 5, 2, 6, 3] }`.
- Answers: `201` with the saved game, `{ id, moves, result, created_at }`.
- Errors: `400` if `moves` is not a list of whole numbers from 0 to 15 (at most
  16 of them). `422` if the moves could not really be played (a cell played
  twice, or a move after the game ended) or the game did not end. `500` if the
  database fails.
- Tables: writes `games`, with the logged-in user as `owner_id` and the result
  the server calculated.

**`GET /api/games`** - the logged-in user's games, newest first.

- Receives: nothing.
- Answers: `200` with a list of `{ id, moves, result, created_at }`.
- Errors: `500` if the database fails.
- Tables: reads `games`, only rows where `owner_id` is the logged-in user.

### Part 2 - Space pictures

**`GET /api/nasa/pictures`** - up to 20 random APOD pictures.

- Receives: nothing.
- Answers: `200` with a list of `{ date, title, explanation, url, copyright }`.
  The server asks NASA for 20 random entries and keeps only the images (some
  APOD entries are videos), so the list can have fewer than 20.
- Errors: `502` if NASA fails, answers something unexpected, or does not answer
  in time.
- Tables: none.

**`POST /api/nasa/explanations`** - explain one picture in Hebrew.

- Receives: `{ date }`, for example `{ "date": "2024-01-01" }`. Only the date:
  the server gets the title and the explanation from NASA itself.
- Answers: `200` with `{ date, title_he, summary_he, tags }`. If the picture was
  explained before, by anyone, this is the saved answer and Gemini is not
  called.
- Errors: `400` if the date is not a valid `YYYY-MM-DD` date. `404` if NASA has
  no picture for that date. `502` if NASA fails, if Gemini fails, or if Gemini's
  answer does not match the schema. `500` if the database fails.
- Tables: reads `apod_explanations`. If there is no row for the date, it calls
  NASA and Gemini, then writes the new row.

## One trade-off

**Save the moves, not only the result.** The list on the page only needs the
result and the date, so `games` could have just a `result` column. I save
`moves` too. It costs a little more space, but a saved game can always be
checked again with the same functions in `shared/game/`, and the page can draw
each saved game as a small board. Saving only the result would mean that a game,
once saved, can never be checked or shown again.
