import { useState } from 'react'
import type { Match } from '../lib/api'
import { setMatchResult, startNextMatch } from '../lib/api'

/**
 * Hidden admin overlay. Two actions, both guarded by a secret code checked
 * server-side:
 *  1. Enter the current match's result (recomputes everyone's gains).
 *  2. Launch the next match once its opponent and date are known.
 * Between the two, the app sits on the waiting screen.
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
  const [code, setCode] = useState('')

  const finished = match && match.home_actual != null && match.away_actual != null
  const homeTeam = match?.home_team ?? 'France'
  const awayTeam = match?.away_team ?? 'Adversaire'

  // --- Result section ---
  const [home, setHome] = useState(match?.home_actual ?? 0)
  const [away, setAway] = useState(match?.away_actual ?? 0)
  const [savingResult, setSavingResult] = useState(false)
  const [resultMsg, setResultMsg] = useState<string | null>(null)
  const [resultErr, setResultErr] = useState<string | null>(null)

  const saveResult = async () => {
    setSavingResult(true)
    setResultErr(null)
    setResultMsg(null)
    try {
      await setMatchResult(home, away, code)
      setResultMsg(`✅ ${homeTeam} ${home} – ${away} ${awayTeam} enregistré`)
      onSaved()
    } catch (e) {
      setResultErr(e instanceof Error ? e.message : String(e))
    } finally {
      setSavingResult(false)
    }
  }

  // --- Next match section ---
  const [opponent, setOpponent] = useState('')
  const [datetime, setDatetime] = useState('')
  const [savingNext, setSavingNext] = useState(false)
  const [nextMsg, setNextMsg] = useState<string | null>(null)
  const [nextErr, setNextErr] = useState<string | null>(null)

  const launchNext = async () => {
    setSavingNext(true)
    setNextErr(null)
    setNextMsg(null)
    try {
      const d = new Date(datetime)
      if (isNaN(d.getTime())) throw new Error('Date invalide')
      const datePart = d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
      const timePart = d
        .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        .replace(':', 'h')
      const text = `${datePart} · ${timePart}`.replace(/^./, (c) => c.toUpperCase())
      await startNextMatch(opponent, text, d.toISOString(), code)
      setNextMsg(`✅ Match lancé : France – ${opponent.toUpperCase()}`)
      onSaved()
    } catch (e) {
      setNextErr(e instanceof Error ? e.message : String(e))
    } finally {
      setSavingNext(false)
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
          maxHeight: '92%',
          overflowY: 'auto',
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
            marginBottom: 14,
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
            Admin
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

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code admin"
          type="password"
          style={inputStyle}
        />

        {/* ---- Result of the current match ---- */}
        <SectionLabel>Résultat du match en cours</SectionLabel>
        {match ? (
          <>
            <div style={{ color: '#5b6175', fontSize: 13, marginBottom: 14 }}>
              {match.round} · {homeTeam} vs {awayTeam}
              {finished ? ' (déjà saisi, modifiable)' : ''}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
                marginBottom: 14,
              }}
            >
              <ScoreInput label={homeTeam} value={home} onChange={setHome} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#cdd2e2' }}>
                –
              </span>
              <ScoreInput label={awayTeam} value={away} onChange={setAway} />
            </div>
            {resultErr && <ErrorText>{resultErr}</ErrorText>}
            {resultMsg && <SuccessText>{resultMsg}</SuccessText>}
            <button
              onClick={saveResult}
              disabled={savingResult || code.length === 0}
              style={{ ...primaryBtn, opacity: savingResult || !code ? 0.5 : 1 }}
            >
              {savingResult ? 'Enregistrement…' : 'Valider le résultat'}
            </button>
          </>
        ) : (
          <div style={{ color: '#9aa0b4', fontSize: 14, marginBottom: 8 }}>
            Aucun match en cours.
          </div>
        )}

        <div style={{ height: 1, background: '#eef0f4', margin: '24px 0' }} />

        {/* ---- Launch the next match ---- */}
        <SectionLabel>Lancer le match suivant</SectionLabel>
        <div style={{ color: '#5b6175', fontSize: 13, marginBottom: 14 }}>
          Quand l'adversaire et la date sont connus. La France passe alors en
          mode prono pour ce nouveau match.
        </div>
        <input
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="Adversaire (ex. Brésil)"
          style={inputStyle}
        />
        <input
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          type="datetime-local"
          style={inputStyle}
        />
        {nextErr && <ErrorText>{nextErr}</ErrorText>}
        {nextMsg && <SuccessText>{nextMsg}</SuccessText>}
        <button
          onClick={launchNext}
          disabled={savingNext || !code || !opponent || !datetime}
          style={{
            ...primaryBtn,
            background: '#e0312a',
            opacity: savingNext || !code || !opponent || !datetime ? 0.5 : 1,
          }}
        >
          {savingNext ? 'Lancement…' : 'Lancer le match suivant'}
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 50,
  borderRadius: 12,
  border: '1.5px solid #e7e9f2',
  padding: '0 16px',
  fontSize: 16,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  marginBottom: 12,
}

const primaryBtn: React.CSSProperties = {
  marginTop: 4,
  width: '100%',
  height: 54,
  border: 'none',
  borderRadius: 14,
  background: '#14307a',
  color: '#fff',
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: 17,
  cursor: 'pointer',
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: '#9aa0b4',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: '#e0312a', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
      {children}
    </div>
  )
}

function SuccessText({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: '#2a8a5b', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
      {children}
    </div>
  )
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
