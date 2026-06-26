import { useCallback, useEffect, useState } from 'react'
import { fetchMessages, postMessage, type Message } from '../lib/api'

/** Loads the family messages and keeps them fresh (poll every 25s). */
export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])

  const load = useCallback(async () => {
    try {
      setMessages(await fetchMessages())
    } catch {
      /* banner is non-critical — stay quiet on errors */
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 25_000)
    return () => clearInterval(id)
  }, [load])

  const post = useCallback(
    async (author: string, text: string) => {
      await postMessage(author, text)
      await load()
    },
    [load],
  )

  return { messages, post }
}

/**
 * The "TV banner": rotates through the latest messages one at a time with a
 * little fade-in, sitting next to the clock at the top of the prono screen.
 */
export function MessageTicker({ messages }: { messages: Message[] }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (messages.length < 2) return
    const id = setInterval(() => setI((x) => x + 1), 4500)
    return () => clearInterval(id)
  }, [messages.length])

  if (messages.length === 0) return null
  const m = messages[i % messages.length]

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        marginLeft: 14,
        overflow: 'hidden',
      }}
    >
      <div
        key={i}
        style={{
          maxWidth: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 600,
          fontSize: 12,
          color: '#9fb4e8',
          animation: 'tickerIn .4s ease',
        }}
      >
        <span style={{ color: '#fff', fontWeight: 800 }}>{m.author}</span>
        <span style={{ opacity: 0.6 }}> · </span>
        {m.text}
      </div>
    </div>
  )
}

/**
 * Floating 💬 button (bottom-right of the prono screen) that opens a small
 * composer. Posts as the current player.
 */
export function MessageBubble({
  playerName,
  onPost,
}: {
  playerName: string
  onPost: (author: string, text: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    const clean = text.trim()
    if (!clean) return
    setSending(true)
    try {
      await onPost(playerName, clean)
      setText('')
      setOpen(false)
    } catch {
      /* ignore — keep what they typed */
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Envoyer un message"
        style={{
          position: 'absolute',
          right: 16,
          bottom: 150,
          zIndex: 20,
          width: 54,
          height: 54,
          borderRadius: '50%',
          border: 'none',
          background: '#fff',
          boxShadow: '0 8px 22px rgba(0,0,0,.35)',
          fontSize: 24,
          cursor: 'pointer',
          animation: 'bubblePop .25s ease',
        }}
      >
        💬
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
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
              fontFamily: 'var(--font-body)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
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
                Ton message
              </div>
              <button
                onClick={() => setOpen(false)}
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
            <div style={{ color: '#5b6175', fontSize: 13, marginBottom: 14 }}>
              en tant que <b>{playerName}</b> · visible par toute la Tribu
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
              autoFocus
              placeholder="Allez les Bleus ! 🇫🇷"
              rows={3}
              style={{
                width: '100%',
                borderRadius: 14,
                border: '1.5px solid #e7e9f2',
                padding: '12px 14px',
                fontSize: 16,
                fontFamily: 'var(--font-body)',
                outline: 'none',
                resize: 'none',
                marginBottom: 4,
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: '#9aa0b4', marginBottom: 12 }}>
              {text.length}/200
            </div>

            <button
              onClick={send}
              disabled={sending || text.trim().length === 0}
              style={{
                width: '100%',
                height: 54,
                border: 'none',
                borderRadius: 14,
                background: '#e0312a',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 17,
                cursor: sending || !text.trim() ? 'default' : 'pointer',
                opacity: sending || !text.trim() ? 0.5 : 1,
              }}
            >
              {sending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
