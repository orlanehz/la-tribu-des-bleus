import { useState } from 'react'
import { StatusBar } from '../components/PhoneFrame'

/**
 * Second identity step: ask the player's city, shown next to their name in the
 * message banner (TV style "Chloé, Lyon").
 */
export function CityGate({
  playerName,
  onSubmit,
}: {
  playerName: string
  onSubmit: (city: string) => void
}) {
  const [value, setValue] = useState('')
  const canSubmit = value.trim().length >= 2

  const submit = () => {
    if (canSubmit) onSubmit(value)
  }

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
          padding: '0 32px 60px',
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
          Salut {playerName} !
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 28,
            color: '#fff',
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          Tu es d'où ?
        </div>
        <div
          style={{
            textAlign: 'center',
            color: '#eaf0ff',
            fontWeight: 500,
            fontSize: 14,
            marginTop: 8,
          }}
        >
          Ta ville s'affichera à côté de ton nom dans les messages.
        </div>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ex. Viarmes, Asnières-sur-Oise, Paimpol, Parmain"
          autoFocus
          style={{
            marginTop: 28,
            width: '100%',
            height: 58,
            borderRadius: 16,
            border: '1.5px solid rgba(255,255,255,.25)',
            background: 'rgba(255,255,255,.08)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 18,
            padding: '0 20px',
            outline: 'none',
            textAlign: 'center',
          }}
        />

        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{
            marginTop: 16,
            width: '100%',
            height: 60,
            border: 'none',
            borderRadius: 16,
            background: canSubmit ? '#e0312a' : 'rgba(224,49,42,.4)',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 19,
            cursor: canSubmit ? 'pointer' : 'default',
            boxShadow: canSubmit ? '0 12px 26px rgba(0,0,0,.35)' : 'none',
            transition: 'background .15s',
          }}
        >
          C'est parti !
        </button>
      </div>
    </div>
  )
}
