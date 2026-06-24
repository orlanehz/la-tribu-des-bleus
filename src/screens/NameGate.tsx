import { useState } from 'react'
import { StatusBar } from '../components/PhoneFrame'

/**
 * First-run screen: ask the player's name before they can predict. Shown on the
 * dark navy background so it flows into the Prono screen once submitted.
 */
export function NameGate({ onSubmit }: { onSubmit: (name: string) => void }) {
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
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              height: 32,
              width: 18,
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0,0,0,.25)',
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
              fontSize: 26,
              color: '#fff',
            }}
          >
            La Tribu des Bleus
          </span>
        </div>

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
          Bienvenue
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
          Quel est ton prénom ?
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
          Il apparaîtra dans le classement de la famille.
        </div>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ex. Léa"
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
