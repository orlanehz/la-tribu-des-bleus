import { useEffect, useState, type ReactNode } from 'react'

/**
 * Full-bleed app shell. On a phone it fills the whole viewport; on a wider
 * screen it's a centered column (max 440px) so it still reads as a mobile app
 * without faking a device bezel.
 */
export function PhoneFrame({
  children,
  screenBg,
}: {
  children: ReactNode
  screenBg: string
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 440,
        height: '100dvh',
        margin: '0 auto',
        background: screenBg,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/** Slim top bar showing the real current time. Color flips per screen. */
export function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? '#0c1226' : '#fff'
  const time = useClock()
  return (
    <div
      style={{
        height: 46,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 28px',
        fontWeight: 700,
        fontSize: 14,
        color,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <span>{time}</span>
    </div>
  )
}
