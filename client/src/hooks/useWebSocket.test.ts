import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWebSocket } from './useWebSocket'

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('connects to websocket on mount', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8080' })
    )

    expect(result.current.status).toBe('connecting')

    await act(async () => {
      vi.advanceTimersByTime(10)
    })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    })
  })

  it('sends messages when connected', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8080' })
    )

    await act(async () => {
      vi.advanceTimersByTime(10)
    })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    })

    act(() => {
      result.current.send({ type: 'test', data: 'hello' })
    })
  })

  it('calls onMessage callback when message received', async () => {
    const onMessage = vi.fn()

    renderHook(() =>
      useWebSocket({
        url: 'ws://localhost:8080',
        onMessage,
      })
    )

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
  })

  it('calls onOpen callback when connected', async () => {
    const onOpen = vi.fn()

    renderHook(() =>
      useWebSocket({
        url: 'ws://localhost:8080',
        onOpen,
      })
    )

    await act(async () => {
      vi.advanceTimersByTime(10)
    })

    await waitFor(() => {
      expect(onOpen).toHaveBeenCalled()
    })
  })

  it('disconnects when disconnect is called', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8080' })
    )

    await act(async () => {
      vi.advanceTimersByTime(10)
    })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    })

    act(() => {
      result.current.disconnect()
    })

    expect(result.current.status).toBe('disconnected')
  })

  it('reconnects when reconnect is called', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8080' })
    )

    await act(async () => {
      vi.advanceTimersByTime(10)
    })

    await waitFor(() => {
      expect(result.current.status).toBe('connected')
    })

    act(() => {
      result.current.reconnect()
    })

    expect(result.current.status).toBe('connecting')
  })
})
