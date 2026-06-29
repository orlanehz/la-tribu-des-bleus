import { useState } from 'react'
import type { Classement, ClassementRow, MatchResult } from '../lib/api'
import { StatusBar } from '../components/PhoneFrame'
import { BottomNav, type Tab } from '../components/BottomNav'

const eur = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`

export function ClassementScreen({
  classement,
  playerName,
  loading,
  revealPronos,
  onOpenAdmin,
  activeTab,
  onTab,
}: {
  classement: Classement | null
  playerName: string
  loading: boolean
  revealPronos: boolean
  onOpenAdmin: () => void
  activeTab: Tab
  onTab: (t: Tab) => void
}) {
  const rows = classement?.rows ?? []
  const results = classement?.results ?? []
  const currentPot = classement?.currentPot ?? 0
  const totalDistributed = classement?.totalDistributed ?? 0
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#F6F7FB',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusBar dark />
      <div
        style={{
          padding: '8px 22px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 24,
            color: '#101427',
          }}
        >
          Classement
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* How the money & points work. */}
          <button
            onClick={() => setShowInfo(true)}
            aria-label="Règles"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 18,
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
            }}
          >
            ℹ️
          </button>
          {/* Discreet admin entry — opens a code-protected result form. */}
          <button
            onClick={onOpenAdmin}
            aria-label="Admin"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#c2c7d6',
              fontSize: 18,
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Money summary: what's in play now, and what's been won since the start. */}
      <div style={{ display: 'flex', gap: 10, padding: '0 18px 14px' }}>
        <SummaryPill
          label="En jeu"
          value={currentPot > 0 ? eur(currentPot) : '—'}
          bg="#14307a"
        />
        <SummaryPill
          label="Gagné depuis le début"
          value={eur(totalDistributed)}
          bg="#2a8a5b"
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 12px' }}>
        {loading ? (
          <EmptyState text="Chargement du classement…" />
        ) : rows.length === 0 ? (
          <EmptyState text="Personne n'a encore joué. Sois le premier !" />
        ) : (
          <>
            {rows.map((row, i) => (
              <PlayerRow
                key={row.name}
                rank={i + 1}
                row={row}
                isMe={row.name === playerName}
                reveal={revealPronos}
              />
            ))}

            {results.length > 0 && (
              <>
                <SectionTitle>Résultats des matchs</SectionTitle>
                {results.map((r) => (
                  <MatchRow key={r.id} result={r} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {showInfo && <RulesSheet onClose={() => setShowInfo(false)} />}

      <BottomNav active={activeTab} onChange={onTab} variant="light" />
    </div>
  )
}

function RulesSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(12,18,38,.55)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '20px 22px calc(22px + env(safe-area-inset-bottom))',
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
            Comment ça marche 💶
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

        <Rule emoji="🎟️" title="La cagnotte">
          Chaque match : <b>1 € par joueur</b>. La cagnotte du match = 1 € × nombre
          de joueurs.
        </Rule>
        <Rule emoji="🥇" title="Le gagnant du match">
          Le meilleur prono remporte la cagnotte : <b>score exact = 3 points</b>,{' '}
          <b>bon vainqueur = 1 point</b>, à côté = 0.
        </Rule>
        <Rule emoji="🤝" title="Égalité">
          Si plusieurs ont le même meilleur score, la cagnotte est{' '}
          <b>partagée</b> à parts égales.
        </Rule>
        <Rule emoji="❌" title="Personne ne marque">
          La cagnotte n'est pas distribuée.
        </Rule>
        <Rule emoji="⏱️" title="Score final">
          Le prono porte sur le score à la <b>toute fin du match</b> :
          prolongations et tirs au but inclus s'il y en a.
        </Rule>
      </div>
    </div>
  )
}

function Rule({
  emoji,
  title,
  children,
}: {
  emoji: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
      <span style={{ fontSize: 22, flex: 'none' }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#101427' }}>{title}</div>
        <div style={{ fontSize: 14, color: '#5b6175', marginTop: 2, lineHeight: 1.4 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        color: '#9aa0b4',
        fontWeight: 600,
        fontSize: 15,
        padding: '48px 24px',
      }}
    >
      {text}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#9aa0b4',
        margin: '20px 4px 10px',
      }}
    >
      {children}
    </div>
  )
}

function SummaryPill({ label, value, bg }: { label: string; value: string; bg: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: bg,
        color: '#fff',
        borderRadius: 16,
        padding: '10px 14px',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>{label}</div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 20,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function PlayerRow({
  rank,
  row,
  isMe,
  reveal,
}: {
  rank: number
  row: ClassementRow
  isMe: boolean
  reveal: boolean
}) {
  // Trophy only for an actual money leader, not when everyone is at 0 €.
  const isLeader = rank === 1 && row.euros > 0

  const cardStyle: React.CSSProperties = isLeader
    ? { background: '#fff', border: '1.5px solid #e6a817' }
    : isMe
    ? { background: '#eef1fb', border: '1.5px solid #14307a' }
    : { background: '#fff', border: '1px solid #e7e9f2' }

  const nameColor = isMe ? '#14307a' : '#101427'
  const nameWeight = isLeader || isMe ? 800 : 700
  const label = isMe ? `Toi · ${row.name}` : row.name

  // Prono sub-line: revealed score after kickoff, locked hint before, nothing
  // if they didn't play the current match.
  let pronoLine: React.ReactNode = null
  if (row.prono) {
    pronoLine = reveal ? (
      <span>
        Prono : <b style={{ color: '#14307a' }}>{row.prono.home} – {row.prono.away}</b>
      </span>
    ) : (
      <span>Prono enregistré 🔒</span>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        borderRadius: 18,
        padding: 16,
        marginBottom: 9,
        ...cardStyle,
      }}
    >
      {isLeader ? (
        <span style={{ fontSize: 22, width: 26, textAlign: 'center' }}>🏆</span>
      ) : (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 18,
            color: isMe ? '#14307a' : '#9aa0b4',
            width: 26,
            textAlign: 'center',
          }}
        >
          {rank}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: nameWeight, fontSize: 17, color: nameColor }}>{label}</div>
        {pronoLine && (
          <div style={{ fontSize: 12, color: '#9aa0b4', fontWeight: 600, marginTop: 2 }}>
            {pronoLine}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 20,
            color: row.euros > 0 ? '#2a8a5b' : '#c2c7d6',
          }}
        >
          {eur(row.euros)}
        </div>
        <div style={{ fontSize: 11, color: '#9aa0b4', fontWeight: 600, marginTop: 1 }}>
          en cours {eur(row.eurosCurrent)}
        </div>
      </div>
    </div>
  )
}

function MatchRow({ result: r }: { result: MatchResult }) {
  let outcome: React.ReactNode
  if (r.rolledOver) {
    outcome = (
      <span style={{ color: '#b8860b', fontWeight: 700 }}>
        Personne — {eur(r.pot)} reportés
      </span>
    )
  } else if (r.winners.length === 1) {
    outcome = (
      <span style={{ color: '#2a8a5b', fontWeight: 700 }}>
        🏆 {r.winners[0]} (+{eur(r.sharePerWinner)})
      </span>
    )
  } else {
    outcome = (
      <span style={{ color: '#2a8a5b', fontWeight: 700 }}>
        Partagé : {r.winners.join(', ')} (+{eur(r.sharePerWinner)} chacun)
      </span>
    )
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e7e9f2',
        borderRadius: 16,
        padding: '12px 14px',
        marginBottom: 9,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, color: '#101427' }}>
          {r.homeTeam} <b>{r.homeActual}</b> – <b>{r.awayActual}</b> {r.awayTeam}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 13,
            color: '#14307a',
            whiteSpace: 'nowrap',
          }}
        >
          {eur(r.pot)}
        </div>
      </div>
      <div style={{ fontSize: 13, marginTop: 4 }}>{outcome}</div>
    </div>
  )
}
