import { useState } from 'react'

const KEY = 'tribu_player_name'

/** Remembers the player's first name on this device so they only type it once. */
export function usePlayerName() {
  const [name, setName] = useState<string>(() => localStorage.getItem(KEY) ?? '')

  const save = (value: string) => {
    const trimmed = value.trim()
    localStorage.setItem(KEY, trimmed)
    setName(trimmed)
  }

  const clear = () => {
    localStorage.removeItem(KEY)
    setName('')
  }

  return { name, save, clear }
}
