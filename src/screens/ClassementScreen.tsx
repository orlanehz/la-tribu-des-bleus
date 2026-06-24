import type { LeaderboardRow } from '../lib/api'
import { StatusBar } from '../components/PhoneFrame'
import { BottomNav, type Tab } from '../components/BottomNav'

export function ClassementScreen({
  rows,
  pot,
  playerName,
  loading,
  activeTab,
  onTab,
}: {
  rows: LeaderboardRow[]
  pot: string
  playerName: string
  loading: boolean
  activeTab: Tab
  onTab: (t: Tab) => void
}) {
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
        <div
          style={{
            background: '#14307a',
            color: '#fff',
            borderRadius: 999,
            padding: '8px 16px',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          {pot}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 12px' }}>
        {loading ? (
          <EmptyState text="Chargement du classement…" />
        ) : rows.length === 0 ? (
          <EmptyState text="Personne n'a encore joué. Sois le premier !" />
        ) : (
          rows.map((row, i) => (
            <PlayerRow
              key={row.name}
              rank={i + 1}
              row={row}
              isMe={row.name === playerName}
            />
          ))
        )}
      </div>

      <BottomNav active={activeTab} onChange={onTab} variant="light" />
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

function PlayerRow({
  rank,
  row,
  isMe,
}: {
  rank: number
  row: LeaderboardRow
  isMe: boolean
}) {
  const isLeader = rank === 1

  const cardStyle: React.CSSProperties = isLeader
    ? { background: '#fff', border: '1.5px solid #e6a817' }
    : isMe
    ? { background: '#eef1fb', border: '1.5px solid #14307a' }
    : { background: '#fff', border: '1px solid #e7e9f2' }

  const nameColor = isMe ? '#14307a' : '#101427'
  const nameWeight = isLeader || isMe ? 800 : 700
  const label = isMe ? `Toi · ${row.name}` : row.name

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
      <div style={{ flex: 1, fontWeight: nameWeight, fontSize: 17, color: nameColor }}>
        {label}
      </div>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 22,
          color: '#14307a',
        }}
      >
        {row.points}
      </span>
    </div>
  )
}
