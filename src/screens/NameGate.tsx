import { useMemo } from 'react'
import { StatusBar } from '../components/PhoneFrame'
import { PARTICIPANTS } from '../data/participants'

// A stable, pleasant color per name for the avatar circle.
const AVATAR_COLORS = [
  '#14307a',
  '#e0312a',
  '#2a8a5b',
  '#b8860b',
  '#7a3a9e',
  '#0d7b8a',
  '#c1567a',
]
function colorFor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

/**
 * First-run screen: pick who you are from the family list. Names that have
 * already submitted a prediction for the current match are greyed out.
 */
export function NameGate({
  playedNames,
  onSubmit,
}: {
  playedNames: string[]
  onSubmit: (name: string) => void
}) {
  const played = useMemo(() => new Set(playedNames), [playedNames])
  const names = useMemo(
    () => [...PARTICIPANTS].sort((a, b) => a.localeCompare(b, 'fr')),
    [],
  )

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

      <div style={{ padding: '8px 22px 14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              height: 24,
              width: 13,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0,0,0,.15)',
            }}
          >
            <div style={{ flex: 1, background: '#14307a' }} />
            <div style={{ flex: 1, background: '#fff' }} />
            <div style={{ flex: 1, background: '#e0312a' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 20,
              color: '#101427',
            }}
          >
            La Tribu des Bleus
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 26,
            color: '#101427',
            marginTop: 14,
          }}
        >
          Qui es-tu ?
        </div>
        <div style={{ color: '#5b6175', fontWeight: 500, fontSize: 14, marginTop: 4 }}>
          Choisis ton nom pour faire ton prono. Les noms grisés ont déjà joué.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 16px' }}>
        {names.map((name) => {
          const hasPlayed = played.has(name)
          return (
            <button
              key={name}
              onClick={() => !hasPlayed && onSubmit(name)}
              disabled={hasPlayed}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: hasPlayed ? '#eef0f4' : '#fff',
                border: '1px solid #e7e9f2',
                borderRadius: 16,
                padding: '12px 14px',
                marginBottom: 8,
                cursor: hasPlayed ? 'default' : 'pointer',
                opacity: hasPlayed ? 0.55 : 1,
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  flex: 'none',
                  background: hasPlayed ? '#b8bdcc' : colorFor(name),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                {name[0].toUpperCase()}
              </span>
              <span
                style={{
                  flex: 1,
                  fontWeight: 700,
                  fontSize: 17,
                  color: hasPlayed ? '#9aa0b4' : '#101427',
                  textDecoration: hasPlayed ? 'line-through' : 'none',
                }}
              >
                {name}
              </span>
              {hasPlayed ? (
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#2a8a5b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  ✓ a joué
                </span>
              ) : (
                <span style={{ color: '#cdd2e2', fontSize: 20, fontWeight: 700 }}>›</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
