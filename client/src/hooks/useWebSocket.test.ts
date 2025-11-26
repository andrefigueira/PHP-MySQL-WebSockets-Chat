import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from './useWebSocket'

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('starts in connecting state', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8080' })
    )

    expect(result.current.status).toBe('connecting')
  })

  it('transitions to connected after websocket opens', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8080' })
    )

    expect(result.current.status).toBe('connecting')

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.status).toBe('connected')
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
      await vi.runAllTimersAsync()
    })

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('provides send function', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8080' })
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(typeof result.current.send).toBe('function')
  })

  it('provides disconnect function', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8080' })
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(typeof result.current.disconnect).toBe('function')

    act(() => {
      result.current.disconnect()
    })

    expect(result.current.status).toBe('disconnected')
  })

  it('provides reconnect function', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:8080' })
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.status).toBe('connected')

    act(() => {
      result.current.reconnect()
    })

    expect(result.current.status).toBe('connecting')
  })
})
