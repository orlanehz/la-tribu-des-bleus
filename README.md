# La Tribu des Bleus 🇫🇷

Family World Cup 2026 prediction game. Everyone predicts the score of France's
current match; points are tallied on a shared leaderboard.

**Live:** https://la-tribu-des-bleus.vercel.app

## How it works

- **One running match at a time** (France vs X). You set the opponent and, once
  it's played, the real score.
- Each person enters their first name once (kept on their device), predicts a
  score, and validates.
- **Scoring:** exact score = 3 pts, right winner only = 1 pt. Points are summed
  per player across every finished match.

## Tech

- React + Vite + TypeScript
- Supabase (Postgres + RLS) for shared data
- Deployed on Vercel

## Local development

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + publishable key
npm run dev
```

The app needs two environment variables (see `.env.example`):

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable (anon) key |

## Running the game (Supabase dashboard)

The app only reads data — you drive the game from the **Table editor**:

- **`matches`** — to move to the next match: fill the current row's
  `home_actual` / `away_actual` with the real score (points get awarded), set
  its `is_current` to `false`, then insert a new row with the new `away_team`,
  `round`, `kickoff` and `is_current = true`. France is the default `home_team`.
- **`config.pot`** — the pot amount shown on the leaderboard.

## Note on access

There is no login: anyone with the link can submit a prediction under any name.
This is intentional for a casual family game. Predictions are protected from
deletion by row-level security, but not from being overwritten.
