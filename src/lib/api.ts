import { supabase } from './supabase'

export type Match = {
  id: string
  round: string
  kickoff: string
  kickoff_at: string | null
  home_team: string
  away_team: string
  home_actual: number | null
  away_actual: number | null
  is_current: boolean
}

export type Prediction = {
  match_id: string
  player_name: string
  home_score: number
  away_score: number
}

export type LeaderboardRow = {
  name: string
  points: number
}

/** The match currently open for predictions (matches.is_current = true). */
export async function fetchCurrentMatch(): Promise<Match | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('is_current', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchPot(): Promise<string> {
  const { data, error } = await supabase
    .from('config')
    .select('pot')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw error
  return data?.pot ?? '0 €'
}

/** This player's prediction for a given match, if they've already submitted one. */
export async function fetchMyPrediction(
  matchId: string,
  playerName: string,
): Promise<Prediction | null> {
  const { data, error } = await supabase
    .from('predictions')
    .select('match_id, player_name, home_score, away_score')
    .eq('match_id', matchId)
    .eq('player_name', playerName)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Names that have already submitted a prediction for this match. */
export async function fetchPlayedNames(matchId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('player_name')
    .eq('match_id', matchId)
  if (error) throw error
  return (data ?? []).map((d) => d.player_name)
}

/** Insert or update this player's prediction for the match (one per person). */
export async function savePrediction(p: Prediction): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .upsert(
      { ...p, updated_at: new Date().toISOString() },
      { onConflict: 'match_id,player_name' },
    )
  if (error) throw error
}

/**
 * Admin-only: set the current match's real result. The secret code is verified
 * server-side by the set_match_result function — it never lives in the app.
 */
export async function setMatchResult(
  home: number,
  away: number,
  secret: string,
): Promise<void> {
  const { error } = await supabase.rpc('set_match_result', {
    p_home: home,
    p_away: away,
    p_secret: secret,
  })
  if (error) throw new Error(error.message)
}

const EXACT_POINTS = 3
const WINNER_POINTS = 1

function sign(n: number): number {
  return n > 0 ? 1 : n < 0 ? -1 : 0
}

/**
 * Points for one prediction against a finished match:
 *  - exact score        → 3
 *  - right outcome only → 1   (same winner, or both a draw)
 *  - otherwise          → 0
 */
function scorePrediction(
  pred: { home_score: number; away_score: number },
  match: { home_actual: number; away_actual: number },
): number {
  if (
    pred.home_score === match.home_actual &&
    pred.away_score === match.away_actual
  ) {
    return EXACT_POINTS
  }
  if (sign(pred.home_score - pred.away_score) === sign(match.home_actual - match.away_actual)) {
    return WINNER_POINTS
  }
  return 0
}

/**
 * Build the leaderboard by summing each player's points across every match
 * that already has a real result. Computed client-side — fine for a family.
 */
export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const [matchesRes, predsRes] = await Promise.all([
    supabase
      .from('matches')
      .select('id, home_actual, away_actual')
      .not('home_actual', 'is', null)
      .not('away_actual', 'is', null),
    supabase.from('predictions').select('match_id, player_name, home_score, away_score'),
  ])
  if (matchesRes.error) throw matchesRes.error
  if (predsRes.error) throw predsRes.error

  const finished = new Map(
    (matchesRes.data ?? []).map((m) => [
      m.id,
      { home_actual: m.home_actual as number, away_actual: m.away_actual as number },
    ]),
  )

  const totals = new Map<string, number>()
  // Make sure everyone who ever predicted shows up, even with 0 points.
  for (const pred of predsRes.data ?? []) {
    if (!totals.has(pred.player_name)) totals.set(pred.player_name, 0)
    const match = finished.get(pred.match_id)
    if (match) {
      totals.set(pred.player_name, totals.get(pred.player_name)! + scorePrediction(pred, match))
    }
  }

  return [...totals.entries()]
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
}
