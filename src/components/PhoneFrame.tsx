import type { ReactNode } from 'react'

/**
 * Matches the design's device chrome: a dark bezel (#0c1226) with a 46px
 * outer radius and an inner screen with a 36px radius. The screen background
 * differs per tab, so it's passed in.
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
        width: 390,
        height: 812,
        background: '#0c1226',
        borderRadius: 46,
        padding: 11,
        boxShadow: '0 24px 60px rgba(12,18,38,.28)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 36,
          overflow: 'hidden',
          background: screenBg,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** iOS-style status bar. Color flips between light and dark screens. */
export function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? '#0c1226' : '#fff'
  return (
    <div
      style={{
        height: 46,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        fontWeight: 700,
        fontSize: 14,
        color,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <span>20:58</span>
      <span
        style={{
          width: 17,
          height: 10,
          border: `1.6px solid ${color}`,
          borderRadius: 3,
          display: 'inline-block',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: 1.5,
            background: color,
            borderRadius: 1,
          }}
        />
      </span>
    </div>
  )
}
