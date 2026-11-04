-- Gemini's Hebrew explanations of APOD pictures. A cache shared by all users,
-- so nobody pays twice for the same picture. See docs/design.md.

create table if not exists public.apod_explanations (
  -- APOD has one picture a day, so the date is the picture's id.
  date date primary key,
  title_he text not null,
  summary_he text not null,
  tags text[] not null check (cardinality(tags) between 1 and 5),
  created_at timestamptz not null default now()
);

-- On with no policies, like events: only our server can read it.
alter table public.apod_explanations enable row level security;
