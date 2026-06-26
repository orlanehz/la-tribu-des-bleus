import { useState } from 'react'
import type { Match } from '../lib/api'
import { setMatchResult } from '../lib/api'

/**
 * Hidden admin overlay to enter the real match result. Protected by a secret
 * code checked server-side. On success the leaderboard recomputes everyone's
 * points (exact = 3, right winner = 1).
 */
export function AdminPanel({
  match,
  onClose,
  onSaved,
}: {
  match: Match | null
  onClose: () => void
  onSaved: () => void
}) {
  const [home, setHome] = useState(match?.home_actual ?? 0)
  const [away, setAway] = useState(match?.away_actual ?? 0)
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const homeTeam = match?.home_team ?? 'France'
  const awayTeam = match?.away_team ?? 'Adversaire'

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      await setMatchResult(home, away, code)
      setDone(true)
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(12,18,38,.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '20px 22px calc(22px + env(safe-area-inset-bottom))',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 20,
              color: '#101427',
            }}
          >
            Résultat du match
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 22,
              color: '#9aa0b4',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {done ? (
          <div style={{ padding: '24px 0 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>✅</div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 18,
                color: '#101427',
                marginTop: 8,
              }}
            >
              {homeTeam} {home} – {away} {awayTeam}
            </div>
            <div style={{ color: '#5b6175', fontSize: 14, marginTop: 4 }}>
              Classement mis à jour !
            </div>
            <button
              onClick={onClose}
              style={primaryBtn}
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div style={{ color: '#5b6175', fontSize: 13, marginBottom: 18 }}>
              {match?.round} · entre le score final, les points se recalculent.
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
                marginBottom: 22,
              }}
            >
              <ScoreInput label={homeTeam} value={home} onChange={setHome} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#cdd2e2' }}>
                –
              </span>
              <ScoreInput label={awayTeam} value={away} onChange={setAway} />
            </div>

            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code admin"
              type="password"
              style={{
                width: '100%',
                height: 50,
                borderRadius: 12,
                border: '1.5px solid #e7e9f2',
                padding: '0 16px',
                fontSize: 16,
                fontFamily: 'var(--font-body)',
                outline: 'none',
                marginBottom: 12,
              }}
            />

            {error && (
              <div style={{ color: '#e0312a', fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={saving || code.length === 0}
              style={{
                ...primaryBtn,
                marginTop: 0,
                opacity: saving || code.length === 0 ? 0.5 : 1,
                cursor: saving || code.length === 0 ? 'default' : 'pointer',
              }}
            >
              {saving ? 'Enregistrement…' : 'Valider le résultat'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  marginTop: 16,
  width: '100%',
  height: 56,
  border: 'none',
  borderRadius: 14,
  background: '#14307a',
  color: '#fff',
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: 17,
  cursor: 'pointer',
}

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const clamp = (v: number) => Math.min(30, Math.max(0, v))
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 13,
          color: '#101427',
          marginBottom: 8,
          maxWidth: 110,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => onChange(clamp(value - 1))} style={stepBtn}>
          −
        </button>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 32,
            color: '#101427',
            minWidth: 28,
          }}
        >
          {value}
        </span>
        <button onClick={() => onChange(clamp(value + 1))} style={stepBtn}>
          +
        </button>
      </div>
    </div>
  )
}

const stepBtn: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  border: '1.5px solid #e7e9f2',
  background: '#f6f7fb',
  color: '#14307a',
  fontWeight: 800,
  fontSize: 20,
  cursor: 'pointer',
  lineHeight: 1,
}
