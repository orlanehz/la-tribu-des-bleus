import type { Classement, Match, MatchResult } from '../lib/api'
import { StatusBar } from '../components/PhoneFrame'
import { BottomNav, type Tab } from '../components/BottomNav'

const eur = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`

/**
 * Shown between matches (a result is in but the next match isn't launched yet)
 * and at the very end of the tournament once the final is played.
 *  - Between matches: recap the last match's score, winner(s) and the player's prono.
 *  - After the final (tournamentOver): a celebration with the overall money podium.
 */
export function WaitingScreen({
  match,
  classement,
  tournamentOver,
  myCFr,
  myCOpp,
  hasPrediction,
  activeTab,
  onTab,
}: {
  match: Match | null
  classement: Classement | null
  tournamentOver: boolean
  myCFr: number
  myCOpp: number
  hasPrediction: boolean
  activeTab: Tab
  onTab: (t: Tab) => void
}) {
  const results = classement?.results ?? []
  const rows = classement?.rows ?? []
  const last: MatchResult | undefined =
    (match && results.find((r) => r.id === match.id)) || results[0]

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
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 24px 16px',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        {tournamentOver ? (
          <FinalRecap rows={rows} />
        ) : (
          <>
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
          </>
        )}

        {last && (
          <LastMatchCard
            result={last}
            hasPrediction={hasPrediction}
            myCFr={myCFr}
            myCOpp={myCOpp}
          />
        )}
      </div>

      <BottomNav active={activeTab} onChange={onTab} variant="dark" />
    </div>
  )
}

function LastMatchCard({
  result: r,
  hasPrediction,
  myCFr,
  myCOpp,
}: {
  result: MatchResult
  hasPrediction: boolean
  myCFr: number
  myCOpp: number
}) {
  let outcome: React.ReactNode
  if (r.rolledOver) {
    outcome = (
      <span style={{ color: '#ffd27a', fontWeight: 700 }}>
        Personne — {eur(r.pot)} reportés
      </span>
    )
  } else if (r.winners.length === 1) {
    outcome = (
      <span style={{ color: '#9be8b8', fontWeight: 700 }}>
        🏆 {r.winners[0]} remporte {eur(r.sharePerWinner)}
      </span>
    )
  } else {
    outcome = (
      <span style={{ color: '#9be8b8', fontWeight: 700 }}>
        🏆 À égalité : {r.winners.join(', ')} (+{eur(r.sharePerWinner)} chacun)
      </span>
    )
  }

  return (
    <div
      style={{
        marginTop: 24,
        width: '100%',
        maxWidth: 330,
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
        {r.round} · terminé
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
        {r.homeTeam} {r.homeActual} – {r.awayActual} {r.awayTeam}
      </div>
      <div style={{ fontSize: 13, marginTop: 8 }}>{outcome}</div>
      {hasPrediction && (
        <div style={{ color: '#eaf0ff', fontSize: 12, marginTop: 8, opacity: 0.85 }}>
          Ton prono : {myCFr} – {myCOpp}
        </div>
      )}
    </div>
  )
}

function FinalRecap({ rows }: { rows: Classement['rows'] }) {
  const podium = rows.filter((r) => r.euros > 0).slice(0, 3)
  const medals = ['🥇', '🥈', '🥉']
  const champion = podium[0]

  return (
    <>
      <div style={{ fontSize: 54 }}>🏆</div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 26,
          color: '#fff',
          marginTop: 8,
        }}
      >
        Coupe du Monde terminée !
      </div>
      {champion ? (
        <>
          <div style={{ color: '#9fb4e8', fontWeight: 500, fontSize: 14, marginTop: 6 }}>
            Grand vainqueur de la Tribu
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 22,
              color: '#ffd27a',
              marginTop: 6,
            }}
          >
            {champion.name} · {eur(champion.euros)}
          </div>

          <div style={{ width: '100%', maxWidth: 330, marginTop: 20 }}>
            {podium.map((r, i) => (
              <div
                key={r.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(255,255,255,.08)',
                  border: '1px solid rgba(255,255,255,.18)',
                  borderRadius: 16,
                  padding: '12px 16px',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 22 }}>{medals[i]}</span>
                <span style={{ flex: 1, textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                  {r.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 18,
                    color: '#9be8b8',
                  }}
                >
                  {eur(r.euros)}
                </span>
              </div>
            ))}
          </div>
          <div style={{ color: '#9fb4e8', fontSize: 13, marginTop: 10 }}>
            Bravo à toute la Tribu des Bleus ! 🇫🇷
          </div>
        </>
      ) : (
        <div style={{ color: '#9fb4e8', fontWeight: 500, fontSize: 14, marginTop: 10 }}>
          Personne n'a gagné d'argent cette fois. 🤷
        </div>
      )}
    </>
  )
}
