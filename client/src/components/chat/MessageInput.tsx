import { useCallback, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => void
  onTyping: (isTyping: boolean) => void
  disabled?: boolean
}

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const handleTyping = useCallback(() => {
    onTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 2000)
  }, [onTyping])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (trimmed) {
      onSend(trimmed)
      setMessage('')
      onTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-slate-700 bg-slate-800/50 p-4"
    >
      <Input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => {
          setMessage(e.target.value)
          handleTyping()
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
        className="flex-1 border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400"
      />
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        size="icon"
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
