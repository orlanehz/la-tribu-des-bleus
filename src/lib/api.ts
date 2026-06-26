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

export type ClassementRow = {
  name: string
  euros: number // total won across all finished matches
  eurosCurrent: number // won on the current match (0 while it's still in play)
  points: number
  prono?: { home: number; away: number } // their pick for the current match
}

export type MatchResult = {
  id: string
  round: string
  homeTeam: string
  awayTeam: string
  homeActual: number
  awayActual: number
  pot: number
  winners: string[]
  sharePerWinner: number
  rolledOver: boolean
}

export type Classement = {
  rows: ClassementRow[]
  results: MatchResult[]
  currentPot: number // money in play on the current match
  totalDistributed: number // total money won since the start
  stake: number
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

export type Message = {
  author: string
  city: string | null
  text: string
  created_at: string
}

/** Which thread of a match: 'live' (during) or 'post' (after the result). */
export type MessagePhase = 'live' | 'post'

/** Recent messages for one match's banner, in the given phase (newest first). */
export async function fetchMessages(
  matchId: string,
  phase: MessagePhase,
  limit = 40,
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('author, author_city, text, created_at')
    .eq('match_id', matchId)
    .eq('phase', phase)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map((d) => ({
    author: d.author,
    city: d.author_city,
    text: d.text,
    created_at: d.created_at,
  }))
}

/**
 * Post a message attached to the given match. The phase ('live' vs 'post') is
 * set server-side from the match's result state, so it can't be mislabelled.
 */
export async function postMessage(
  matchId: string,
  author: string,
  city: string | null,
  text: string,
): Promise<void> {
  const clean = text.trim().slice(0, 200)
  if (!clean) return
  const { error } = await supabase.from('messages').insert({
    match_id: matchId,
    author: author.slice(0, 40),
    author_city: city ? city.slice(0, 40) : null,
    text: clean,
  })
  if (error) throw error
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

/**
 * Admin-only: activate the next match with its now-known opponent and kickoff.
 * Same secret code, verified server-side.
 */
export async function startNextMatch(
  opponent: string,
  kickoffText: string,
  kickoffAtISO: string,
  secret: string,
): Promise<void> {
  const { error } = await supabase.rpc('start_next_match', {
    p_secret: secret,
    p_opponent: opponent,
    p_kickoff: kickoffText,
    p_kickoff_at: kickoffAtISO,
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
 * The whole money + ranking picture, computed client-side.
 *
 * Rules (chosen by the organiser):
 *  - Each match has its own pot = stake × (players who predicted that match),
 *    plus any rollover carried from earlier matches nobody won.
 *  - The match winner is whoever scored the most points on it (exact = 3 beats
 *    right-winner = 1). Ties split the pot equally.
 *  - If nobody scored on a match, its pot rolls over to the next one.
 *
 * Matches are processed in chronological order so the rollover carries forward.
 */
export async function fetchClassement(): Promise<Classement> {
  const [cfgRes, matchesRes, predsRes] = await Promise.all([
    supabase.from('config').select('stake_eur').eq('id', 1).maybeSingle(),
    supabase
      .from('matches')
      .select('id, round, home_team, away_team, home_actual, away_actual, is_current, kickoff_at')
      .order('kickoff_at', { ascending: true, nullsFirst: false }),
    supabase.from('predictions').select('match_id, player_name, home_score, away_score'),
  ])
  if (cfgRes.error) throw cfgRes.error
  if (matchesRes.error) throw matchesRes.error
  if (predsRes.error) throw predsRes.error

  const stake = Number(cfgRes.data?.stake_eur ?? 1)
  const matches = matchesRes.data ?? []
  const preds = predsRes.data ?? []

  const byMatch = new Map<string, typeof preds>()
  for (const p of preds) {
    const list = byMatch.get(p.match_id) ?? []
    list.push(p)
    byMatch.set(p.match_id, list)
  }

  const currentMatch = matches.find((m) => m.is_current) ?? null
  const currentPreds = currentMatch ? byMatch.get(currentMatch.id) ?? [] : []
  const pronoByName = new Map<string, { home: number; away: number }>()
  for (const p of currentPreds) {
    pronoByName.set(p.player_name, { home: p.home_score, away: p.away_score })
  }

  const euros = new Map<string, number>()
  const eurosCurrent = new Map<string, number>()
  const points = new Map<string, number>()
  const ensure = (name: string) => {
    if (!euros.has(name)) euros.set(name, 0)
    if (!points.has(name)) points.set(name, 0)
  }

  const results: MatchResult[] = []
  let carry = 0
  let currentPot = 0

  for (const m of matches) {
    const players = byMatch.get(m.id) ?? []
    for (const p of players) ensure(p.player_name)
    const base = stake * players.length
    const finished = m.home_actual != null && m.away_actual != null

    if (!finished) {
      // The open match: its pot is in play (stake × players + whatever rolled in).
      if (m.is_current) currentPot = base + carry
      continue
    }

    const actual = { home_actual: m.home_actual as number, away_actual: m.away_actual as number }
    const scored = players.map((p) => ({ name: p.player_name, pts: scorePrediction(p, actual) }))
    for (const s of scored) points.set(s.name, points.get(s.name)! + s.pts)

    const maxPts = scored.reduce((mx, s) => Math.max(mx, s.pts), 0)
    const pot = base + carry

    if (maxPts > 0) {
      const winners = scored.filter((s) => s.pts === maxPts).map((s) => s.name)
      const share = pot / winners.length
      for (const w of winners) {
        euros.set(w, euros.get(w)! + share)
        // Track winnings on the current match separately ("gain en cours").
        if (m.is_current) eurosCurrent.set(w, (eurosCurrent.get(w) ?? 0) + share)
      }
      carry = 0
      results.push({
        id: m.id,
        round: m.round,
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        homeActual: actual.home_actual,
        awayActual: actual.away_actual,
        pot,
        winners,
        sharePerWinner: share,
        rolledOver: false,
      })
    } else {
      // Nobody scored → the whole pot rolls into the next match.
      carry = pot
      results.push({
        id: m.id,
        round: m.round,
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        homeActual: actual.home_actual,
        awayActual: actual.away_actual,
        pot,
        winners: [],
        sharePerWinner: 0,
        rolledOver: true,
      })
    }
  }

  const rows: ClassementRow[] = [...euros.keys()]
    .map((name) => ({
      name,
      euros: euros.get(name)!,
      eurosCurrent: eurosCurrent.get(name) ?? 0,
      points: points.get(name)!,
      prono: pronoByName.get(name),
    }))
    .sort((a, b) => b.euros - a.euros || b.points - a.points || a.name.localeCompare(b.name, 'fr'))

  const totalDistributed = [...euros.values()].reduce((s, v) => s + v, 0)

  return { rows, results: results.reverse(), currentPot, totalDistributed, stake }
}
