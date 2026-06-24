export type Tab = 'prono' | 'classement'

/**
 * The footer renders differently on each screen in the design: on the dark
 * Prono screen it sits on a translucent white overlay, on the light
 * Classement screen it's solid white. `variant` drives that.
 */
export function BottomNav({
  active,
  onChange,
  variant,
}: {
  active: Tab
  onChange: (t: Tab) => void
  variant: 'dark' | 'light'
}) {
  const isDark = variant === 'dark'
  return (
    <div
      style={{
        height: 62,
        flex: 'none',
        background: isDark ? 'rgba(255,255,255,.06)' : '#fff',
        borderTop: isDark
          ? '1px solid rgba(255,255,255,.12)'
          : '1px solid #e7e9f2',
        display: 'flex',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <NavItem
        label="Mon prono"
        selected={active === 'prono'}
        onClick={() => onChange('prono')}
        selectedColor="#fff"
        selectedDot="#e0312a"
        idleColor={isDark ? '#9fb4e8' : '#9aa0b4'}
        idleDot={isDark ? '#3a559e' : '#cdd2e2'}
        // On the light screen, the active "Mon prono" tint is red like the design.
        lightSelectedColor="#e0312a"
        light={!isDark}
      />
      <NavItem
        label="Classement"
        selected={active === 'classement'}
        onClick={() => onChange('classement')}
        selectedColor="#fff"
        selectedDot="#e0312a"
        idleColor={isDark ? '#9fb4e8' : '#9aa0b4'}
        idleDot={isDark ? '#3a559e' : '#cdd2e2'}
        lightSelectedColor="#e0312a"
        light={!isDark}
      />
    </div>
  )
}

function NavItem({
  label,
  selected,
  onClick,
  selectedColor,
  selectedDot,
  idleColor,
  idleDot,
  lightSelectedColor,
  light,
}: {
  label: string
  selected: boolean
  onClick: () => void
  selectedColor: string
  selectedDot: string
  idleColor: string
  idleDot: string
  lightSelectedColor: string
  light: boolean
}) {
  const textColor = selected
    ? light
      ? lightSelectedColor
      : selectedColor
    : idleColor
  const dotColor = selected ? selectedDot : idleDot
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        color: textColor,
        fontSize: 12,
        fontWeight: selected ? 800 : 600,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div
        style={{ width: 7, height: 7, borderRadius: 2, background: dotColor }}
      />
      {label}
    </button>
  )
}
