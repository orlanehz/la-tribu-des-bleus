import type { Match } from '../lib/api'
import { StatusBar } from '../components/PhoneFrame'
import { BottomNav, type Tab } from '../components/BottomNav'

export function PronoScreen({
  match,
  playerName,
  cFr,
  cOpp,
  step,
  onValidate,
  saving,
  alreadyPredicted,
  activeTab,
  onTab,
}: {
  match: Match
  playerName: string
  cFr: number
  cOpp: number
  step: (side: 'cFr' | 'cOpp', d: number) => void
  onValidate: () => void
  saving: boolean
  alreadyPredicted: boolean
  activeTab: Tab
  onTab: (t: Tab) => void
}) {
  const buttonLabel = saving
    ? 'Enregistrement…'
    : alreadyPredicted
    ? 'Modifier mon prono'
    : 'Je valide !'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#102463',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120% 60% at 50% 0%,rgba(255,255,255,.10),transparent 60%)',
        }}
      />
      <StatusBar />
      <div style={{ display: 'flex', height: 5, width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1, background: '#fff' }} />
        <div style={{ flex: 1, background: '#e0312a' }} />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 24px 16px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: '#9fb4e8',
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
          }}
        >
          {match.round}
        </div>
        <div
          style={{
            textAlign: 'center',
            color: '#eaf0ff',
            fontWeight: 600,
            fontSize: 14,
            marginTop: 6,
          }}
        >
          {match.kickoff}
        </div>
        <div
          style={{
            textAlign: 'center',
            color: '#9fb4e8',
            fontWeight: 600,
            fontSize: 13,
            marginTop: 4,
          }}
        >
          Prono de {playerName}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 8,
            marginTop: 34,
          }}
        >
          <TeamColumn
            name={match.home_team}
            score={cFr}
            onDec={() => step('cFr', -1)}
            onInc={() => step('cFr', 1)}
          />
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 48,
              color: 'rgba(255,255,255,.32)',
              marginTop: 34,
            }}
          >
            –
          </div>
          <TeamColumn
            name={match.away_team}
            score={cOpp}
            onDec={() => step('cOpp', -1)}
            onInc={() => step('cOpp', 1)}
          />
        </div>

        <button
          onClick={onValidate}
          disabled={saving}
          style={{
            marginTop: 'auto',
            width: '100%',
            height: 64,
            border: 'none',
            borderRadius: 18,
            background: '#e0312a',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 20,
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1,
            boxShadow: '0 12px 26px rgba(0,0,0,.35)',
          }}
        >
          {buttonLabel}
        </button>
      </div>

      <BottomNav active={activeTab} onChange={onTab} variant="dark" />
    </div>
  )
}

function TeamColumn({
  name,
  score,
  onDec,
  onInc,
}: {
  name: string
  score: number
  onDec: () => void
  onInc: () => void
}) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 18,
          color: '#fff',
          letterSpacing: '.02em',
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 92,
          color: '#fff',
          lineHeight: 1,
          marginTop: 8,
        }}
      >
        {score}
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 18 }}
      >
        <button
          onClick={onDec}
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,.4)',
            background: 'rgba(255,255,255,.08)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 26,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          −
        </button>
        <button
          onClick={onInc}
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            border: 'none',
            background: '#e0312a',
            color: '#fff',
            fontWeight: 800,
            fontSize: 24,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}
