import type { Match } from '../lib/api'
import { StatusBar } from '../components/PhoneFrame'
import { BottomNav, type Tab } from '../components/BottomNav'

/**
 * Shown between matches: the current match is over (result entered) or no match
 * is open yet. We don't know the next opponent/date, so this is a calm holding
 * screen. If the last match is finished, we recap its score and the player's prono.
 */
export function WaitingScreen({
  match,
  myCFr,
  myCOpp,
  hasPrediction,
  activeTab,
  onTab,
}: {
  match: Match | null
  myCFr: number
  myCOpp: number
  hasPrediction: boolean
  activeTab: Tab
  onTab: (t: Tab) => void
}) {
  const finished =
    match && match.home_actual != null && match.away_actual != null

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
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 28px',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 52 }}>⏳</div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 24,
            color: '#fff',
            marginTop: 12,
          }}
        >
          En attente du prochain match
        </div>
        <div style={{ color: '#9fb4e8', fontWeight: 500, fontSize: 14, marginTop: 8, maxWidth: 300 }}>
          On ne connaît pas encore l'adversaire ni la date de la France. Reviens vite ! 🇫🇷
        </div>

        {finished && (
          <div
            style={{
              marginTop: 28,
              width: '100%',
              maxWidth: 320,
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.18)',
              borderRadius: 18,
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                color: '#9fb4e8',
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
              }}
            >
              {match!.round} · terminé
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 20,
                color: '#fff',
                marginTop: 6,
              }}
            >
              {match!.home_team} {match!.home_actual} – {match!.away_actual} {match!.away_team}
            </div>
            {hasPrediction && (
              <div style={{ color: '#eaf0ff', fontSize: 13, marginTop: 6 }}>
                Ton prono : {myCFr} – {myCOpp}
              </div>
            )}
            <div style={{ color: '#9fb4e8', fontSize: 12, marginTop: 8 }}>
              Gains dans l'onglet Classement →
            </div>
          </div>
        )}
      </div>

      <BottomNav active={activeTab} onChange={onTab} variant="dark" />
    </div>
  )
}
