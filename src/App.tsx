import { useCallback, useEffect, useState } from 'react'
import { PhoneFrame } from './components/PhoneFrame'
import { PronoScreen } from './screens/PronoScreen'
import { ClassementScreen } from './screens/ClassementScreen'
import { NameGate } from './screens/NameGate'
import { CityGate } from './screens/CityGate'
import { WaitingScreen } from './screens/WaitingScreen'
import { AdminPanel } from './screens/AdminPanel'
import type { Tab } from './components/BottomNav'
import { usePlayerName } from './lib/usePlayerName'
import {
  fetchClassement,
  fetchCurrentMatch,
  fetchMyPrediction,
  fetchPlayedNames,
  savePrediction,
  type Classement,
  type Match,
} from './lib/api'

export default function App() {
  const { name, city, save: saveName, saveCity } = usePlayerName()

  const [tab, setTab] = useState<Tab>('prono')
  const [match, setMatch] = useState<Match | null>(null)
  const [playedNames, setPlayedNames] = useState<string[]>([])
  const [classement, setClassement] = useState<Classement | null>(null)
  const [loadingBoard, setLoadingBoard] = useState(true)
  const [loadingMatch, setLoadingMatch] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cFr, setCFr] = useState(1)
  const [cOpp, setCOpp] = useState(1)
  const [saving, setSaving] = useState(false)
  const [alreadyPredicted, setAlreadyPredicted] = useState(false)

  // Hidden admin panel: opens via the gear on the leaderboard or the #admin URL.
  const [showAdmin, setShowAdmin] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#admin',
  )
  useEffect(() => {
    const onHash = () => setShowAdmin(window.location.hash === '#admin')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const closeAdmin = () => {
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname)
    }
    setShowAdmin(false)
  }

  // Tick every 20s so the lock flips on its own at kickoff even if the page
  // stays open. Predictions close once now >= the match's kickoff_at.
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 20_000)
    return () => clearInterval(id)
  }, [])
  const locked = match?.kickoff_at
    ? nowMs >= new Date(match.kickoff_at).getTime()
    : false

  // Between matches: the current match is over (result entered) or none is open.
  const matchFinished =
    !!match && match.home_actual != null && match.away_actual != null
  const waiting = !match || matchFinished
  // The very end: the final has been played.
  const tournamentOver = matchFinished && match?.round === 'Finale'

  const clamp = (v: number, d: number) => Math.min(9, Math.max(0, v + d))
  const step = (side: 'cFr' | 'cOpp', d: number) => {
    if (locked) return
    if (side === 'cFr') setCFr((v) => clamp(v, d))
    else setCOpp((v) => clamp(v, d))
  }

  const refreshLeaderboard = useCallback(async () => {
    setLoadingBoard(true)
    try {
      setClassement(await fetchClassement())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoadingBoard(false)
    }
  }, [])

  // Load the current match once on mount.
  useEffect(() => {
    let cancelled = false
    fetchCurrentMatch()
      .then((m) => !cancelled && setMatch(m))
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setLoadingMatch(false))
    return () => {
      cancelled = true
    }
  }, [])

  // Whenever the match (or player) changes — including after the admin launches
  // the next match — reload who has played it and this player's own prediction.
  useEffect(() => {
    let cancelled = false
    if (!match) return
    fetchPlayedNames(match.id)
      .then((names) => !cancelled && setPlayedNames(names))
      .catch(() => {})

    // Reset to a fresh prediction, then fill it in if this player already has one.
    setCFr(1)
    setCOpp(1)
    setAlreadyPredicted(false)
    if (name) {
      fetchMyPrediction(match.id, name)
        .then((mine) => {
          if (cancelled || !mine) return
          setCFr(mine.home_score)
          setCOpp(mine.away_score)
          setAlreadyPredicted(true)
        })
        .catch(() => {})
    }
    return () => {
      cancelled = true
    }
  }, [match?.id, name])

  useEffect(() => {
    refreshLeaderboard()
  }, [refreshLeaderboard])

  const validate = async () => {
    if (!match || !name || locked) return
    setSaving(true)
    setError(null)
    try {
      await savePrediction({
        match_id: match.id,
        player_name: name,
        home_score: cFr,
        away_score: cOpp,
      })
      setAlreadyPredicted(true)
      await refreshLeaderboard()
      setTab('classement')
    } catch (e) {
      // The DB trigger rejects writes after kickoff — show a friendly message.
      const msg = String(e).includes('Pronos fermés')
        ? 'Pronos fermés : le match a déjà commencé.'
        : String(e)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PhoneFrame screenBg={!name ? '#F6F7FB' : tab === 'prono' ? '#102463' : '#F6F7FB'}>
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 12,
            right: 12,
            zIndex: 10,
            color: '#fff',
            background: '#e0312a',
            borderRadius: 12,
            padding: '8px 12px',
            fontWeight: 600,
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

        {!name ? (
          <NameGate playedNames={playedNames} onSubmit={saveName} />
        ) : !city ? (
          <CityGate playerName={name} onSubmit={saveCity} />
        ) : tab === 'prono' ? (
          loadingMatch ? (
            <CenterMessage dark text="Chargement du match…" />
          ) : waiting ? (
            <WaitingScreen
              match={match}
              classement={classement}
              tournamentOver={tournamentOver}
              playerName={name}
              playerCity={city}
              myCFr={cFr}
              myCOpp={cOpp}
              hasPrediction={alreadyPredicted}
              activeTab={tab}
              onTab={setTab}
            />
          ) : (
            <PronoScreen
              match={match!}
              playerName={name}
              playerCity={city}
              cFr={cFr}
              cOpp={cOpp}
              step={step}
              onValidate={validate}
              saving={saving}
              alreadyPredicted={alreadyPredicted}
              locked={locked}
              activeTab={tab}
              onTab={setTab}
            />
          )
        ) : (
          <ClassementScreen
            classement={classement}
            playerName={name}
            loading={loadingBoard}
            onOpenAdmin={() => setShowAdmin(true)}
            activeTab={tab}
            onTab={setTab}
          />
        )}

        {showAdmin && (
          <AdminPanel
            match={match}
            onClose={closeAdmin}
            onSaved={() => {
              refreshLeaderboard()
              fetchCurrentMatch().then((m) => setMatch(m)).catch(() => {})
            }}
          />
        )}
      </PhoneFrame>
  )
}

function CenterMessage({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: dark ? '#102463' : '#F6F7FB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        textAlign: 'center',
        color: dark ? '#9fb4e8' : '#9aa0b4',
        fontWeight: 600,
        fontSize: 15,
      }}
    >
      {text}
    </div>
  )
}
