import type { Match } from '../lib/api'
import { StatusBar } from '../components/PhoneFrame'
import { BottomNav, type Tab } from '../components/BottomNav'
import { MessageBubble, MessageTicker, useMessages } from '../components/Messages'

export function PronoScreen({
  match,
  playerName,
  playerCity,
  cFr,
  cOpp,
  step,
  onValidate,
  saving,
  alreadyPredicted,
  locked,
  activeTab,
  onTab,
}: {
  match: Match
  playerName: string
  playerCity: string | null
  cFr: number
  cOpp: number
  step: (side: 'cFr' | 'cOpp', d: number) => void
  onValidate: () => void
  saving: boolean
  alreadyPredicted: boolean
  locked: boolean
  activeTab: Tab
  onTab: (t: Tab) => void
}) {
  const { messages, post } = useMessages(match.id, 'live')

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
      <StatusBar rightSlot={<MessageTicker messages={messages} />} />
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
          {locked ? 'Prono verrouillé de' : 'Prono de'} {playerName}
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
            locked={locked}
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
            locked={locked}
            onDec={() => step('cOpp', -1)}
            onInc={() => step('cOpp', 1)}
          />
        </div>

        {locked ? (
          <div
            style={{
              marginTop: 'auto',
              width: '100%',
              minHeight: 64,
              borderRadius: 18,
              background: 'rgba(255,255,255,.08)',
              border: '1.5px solid rgba(255,255,255,.18)',
              color: '#eaf0ff',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '12px 16px',
              textAlign: 'center',
            }}
          >
            <span>🔒 Pronos fermés</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, color: '#9fb4e8' }}>
              Le match a commencé — ton prono est figé.
            </span>
          </div>
        ) : (
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={onValidate}
              disabled={saving}
              style={{
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
            <div
              style={{
                textAlign: 'center',
                color: '#9fb4e8',
                fontSize: 12,
                fontWeight: 500,
                marginTop: 10,
              }}
            >
              En validant, tu acceptes de miser <b style={{ color: '#eaf0ff' }}>1 €</b> sur ce match.
            </div>
          </div>
        )}
      </div>

      <MessageBubble
        playerName={playerName}
        playerCity={playerCity}
        onPost={(text) => post(playerName, playerCity, text)}
      />

      <BottomNav active={activeTab} onChange={onTab} variant="dark" />
    </div>
  )
}

function TeamColumn({
  name,
  score,
  locked,
  onDec,
  onInc,
}: {
  name: string
  score: number
  locked: boolean
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
      {/* Steppers disappear once the prono is locked — the score stays visible. */}
      {!locked && (
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
      )}
    </div>
  )
}
