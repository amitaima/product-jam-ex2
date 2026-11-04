-- Finished tic-tac-toe games, variant "four". See docs/design.md.

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,

  -- The cells played (0-15), in order, X first. The shortest finished game
  -- has 7 moves and the longest has 16.
  moves jsonb not null check (
    jsonb_typeof(moves) = 'array' and jsonb_array_length(moves) between 7 and 16
  ),

  -- Calculated by the server from the moves, never sent by the browser.
  result text not null check (result in ('X', 'O', 'draw')),

  created_at timestamptz not null default now()
);

-- "My games, newest first".
create index if not exists games_owner_id_created_at_idx
  on public.games (owner_id, created_at desc);

-- On with no policies, like events: only our server can read it.
alter table public.games enable row level security;
