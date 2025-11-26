import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConnectionStatus, WebSocketMessage } from '@/types/chat'

interface UseWebSocketOptions {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnectAttempts?: number
  reconnectInterval?: number
}

interface UseWebSocketReturn {
  status: ConnectionStatus
  send: (data: object) => void
  disconnect: () => void
  reconnect: () => void
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = undefined
    }
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    clearReconnectTimeout()
    setStatus('connecting')

    const ws = new WebSocket(url)

    ws.onopen = () => {
      setStatus('connected')
      reconnectCountRef.current = 0
      onOpen?.()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage
        onMessage?.(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      setStatus('disconnected')
      wsRef.current = null
      onClose?.()

      if (reconnectCountRef.current < reconnectAttempts) {
        reconnectCountRef.current += 1
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }
    }

    ws.onerror = (error) => {
      setStatus('error')
      onError?.(error)
    }

    wsRef.current = ws
  }, [url, onMessage, onOpen, onClose, onError, reconnectAttempts, reconnectInterval, clearReconnectTimeout])

  const disconnect = useCallback(() => {
    clearReconnectTimeout()
    reconnectCountRef.current = reconnectAttempts
    wsRef.current?.close()
    wsRef.current = null
    setStatus('disconnected')
  }, [clearReconnectTimeout, reconnectAttempts])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectCountRef.current = 0
    connect()
  }, [disconnect, connect])

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return { status, send, disconnect, reconnect }
}
