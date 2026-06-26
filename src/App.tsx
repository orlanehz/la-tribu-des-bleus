import { useCallback, useEffect, useState } from 'react'
import { PhoneFrame } from './components/PhoneFrame'
import { PronoScreen } from './screens/PronoScreen'
import { ClassementScreen } from './screens/ClassementScreen'
import { NameGate } from './screens/NameGate'
import { AdminPanel } from './screens/AdminPanel'
import type { Tab } from './components/BottomNav'
import { usePlayerName } from './lib/usePlayerName'
import {
  fetchCurrentMatch,
  fetchLeaderboard,
  fetchMyPrediction,
  fetchPlayedNames,
  fetchPot,
  savePrediction,
  type LeaderboardRow,
  type Match,
} from './lib/api'

export default function App() {
  const { name, save: saveName } = usePlayerName()

  const [tab, setTab] = useState<Tab>('prono')
  const [match, setMatch] = useState<Match | null>(null)
  const [playedNames, setPlayedNames] = useState<string[]>([])
  const [pot, setPot] = useState('—')
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([])
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

  const clamp = (v: number, d: number) => Math.min(9, Math.max(0, v + d))
  const step = (side: 'cFr' | 'cOpp', d: number) => {
    if (locked) return
    if (side === 'cFr') setCFr((v) => clamp(v, d))
    else setCOpp((v) => clamp(v, d))
  }

  const refreshLeaderboard = useCallback(async () => {
    setLoadingBoard(true)
    try {
      setLeaderboard(await fetchLeaderboard())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoadingBoard(false)
    }
  }, [])

  // Load match + pot once, and the player's existing prediction once we know them.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [m, p] = await Promise.all([fetchCurrentMatch(), fetchPot()])
        if (cancelled) return
        setMatch(m)
        setPot(p)
        if (m) {
          // Who's already played → greys out names in the picker.
          fetchPlayedNames(m.id)
            .then((names) => !cancelled && setPlayedNames(names))
            .catch(() => {})
        }
        if (m && name) {
          const mine = await fetchMyPrediction(m.id, name)
          if (!cancelled && mine) {
            setCFr(mine.home_score)
            setCOpp(mine.away_score)
            setAlreadyPredicted(true)
          }
        }
      } catch (e) {
        if (!cancelled) setError(String(e))
      } finally {
        if (!cancelled) setLoadingMatch(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [name])

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
        ) : tab === 'prono' ? (
          loadingMatch ? (
            <CenterMessage dark text="Chargement du match…" />
          ) : match ? (
            <PronoScreen
              match={match}
              playerName={name}
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
          ) : (
            <CenterMessage dark text="Aucun match en cours. Reviens bientôt !" />
          )
        ) : (
          <ClassementScreen
            rows={leaderboard}
            pot={pot}
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
