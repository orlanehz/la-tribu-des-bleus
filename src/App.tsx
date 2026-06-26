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
    <PhoneFrame screenBg={tab === 'prono' || !name ? '#102463' : '#F6F7FB'}>
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
