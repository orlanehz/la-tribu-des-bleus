import { useState } from 'react'

const NAME_KEY = 'tribu_player_name'
const CITY_KEY = 'tribu_player_city'

/**
 * Remembers the player's identity (first name + city) on this device so they
 * only enter it once.
 */
export function usePlayerName() {
  const [name, setName] = useState<string>(() => localStorage.getItem(NAME_KEY) ?? '')
  const [city, setCity] = useState<string>(() => localStorage.getItem(CITY_KEY) ?? '')

  const saveName = (value: string) => {
    const trimmed = value.trim()
    localStorage.setItem(NAME_KEY, trimmed)
    setName(trimmed)
  }

  const saveCity = (value: string) => {
    const trimmed = value.trim()
    localStorage.setItem(CITY_KEY, trimmed)
    setCity(trimmed)
  }

  const clear = () => {
    localStorage.removeItem(NAME_KEY)
    localStorage.removeItem(CITY_KEY)
    setName('')
    setCity('')
  }

  return { name, city, save: saveName, saveCity, clear }
}
