import { useCallback, useEffect, useState } from 'react'
import { PhoneFrame } from './components/PhoneFrame'
import { PronoScreen } from './screens/PronoScreen'
import { ClassementScreen } from './screens/ClassementScreen'
import { NameGate } from './screens/NameGate'
import type { Tab } from './components/BottomNav'
import { usePlayerName } from './lib/usePlayerName'
import {
  fetchCurrentMatch,
  fetchLeaderboard,
  fetchMyPrediction,
  fetchPot,
  savePrediction,
  type LeaderboardRow,
  type Match,
} from './lib/api'

export default function App() {
  const { name, save: saveName } = usePlayerName()

  const [tab, setTab] = useState<Tab>('prono')
  const [match, setMatch] = useState<Match | null>(null)
  const [pot, setPot] = useState('—')
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([])
  const [loadingBoard, setLoadingBoard] = useState(true)
  const [loadingMatch, setLoadingMatch] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cFr, setCFr] = useState(1)
  const [cOpp, setCOpp] = useState(1)
  const [saving, setSaving] = useState(false)
  const [alreadyPredicted, setAlreadyPredicted] = useState(false)

  const clamp = (v: number, d: number) => Math.min(9, Math.max(0, v + d))
  const step = (side: 'cFr' | 'cOpp', d: number) => {
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
    if (!match || !name) return
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
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px 64px',
      }}
    >
      <Header />

      {error && (
        <div
          style={{
            color: '#e0312a',
            fontWeight: 600,
            fontSize: 13,
            marginBottom: 16,
            maxWidth: 390,
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <PhoneFrame screenBg={tab === 'prono' || !name ? '#102463' : '#F6F7FB'}>
        {!name ? (
          <NameGate onSubmit={saveName} />
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
            activeTab={tab}
            onTab={setTab}
          />
        )}
      </PhoneFrame>
    </div>
  )
}

function Header() {
  return (
    <header style={{ fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            height: 26,
            width: 14,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,.15)',
          }}
        >
          <div style={{ flex: 1, background: '#14307a' }} />
          <div style={{ flex: 1, background: '#fff' }} />
          <div style={{ flex: 1, background: '#e0312a' }} />
        </div>
        <span style={{ fontWeight: 800, fontSize: 26, color: '#101427', letterSpacing: '-.01em' }}>
          La Tribu des Bleus
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          fontSize: 14,
          color: '#5b6175',
          marginTop: 4,
        }}
      >
        Pronos famille · Coupe du monde 2026
      </div>
    </header>
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
