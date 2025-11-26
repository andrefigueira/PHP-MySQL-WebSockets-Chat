import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageInput } from './MessageInput'

describe('MessageInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders input and send button', () => {
    render(<MessageInput onSend={vi.fn()} onTyping={vi.fn()} />)

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    render(<MessageInput onSend={vi.fn()} onTyping={vi.fn()} />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('send button is enabled when input has value', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<MessageInput onSend={vi.fn()} onTyping={vi.fn()} />)

    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Hello')

    const button = screen.getByRole('button')
    expect(button).toBeEnabled()
  })

  it('calls onSend when form is submitted', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSend = vi.fn()
    render(<MessageInput onSend={onSend} onTyping={vi.fn()} />)

    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Hello')

    const button = screen.getByRole('button')
    await user.click(button)

    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  it('clears input after sending', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<MessageInput onSend={vi.fn()} onTyping={vi.fn()} />)

    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Hello')

    const button = screen.getByRole('button')
    await user.click(button)

    expect(input).toHaveValue('')
  })

  it('trims whitespace from message', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSend = vi.fn()
    render(<MessageInput onSend={onSend} onTyping={vi.fn()} />)

    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, '  Hello  ')

    const button = screen.getByRole('button')
    await user.click(button)

    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  it('calls onTyping when user types', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onTyping = vi.fn()
    render(<MessageInput onSend={vi.fn()} onTyping={onTyping} />)

    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'H')

    expect(onTyping).toHaveBeenCalledWith(true)
  })

  it('disables input and button when disabled prop is true', () => {
    render(<MessageInput onSend={vi.fn()} onTyping={vi.fn()} disabled />)

    expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('sends message on Enter key press', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSend = vi.fn()
    render(<MessageInput onSend={onSend} onTyping={vi.fn()} />)

    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Hello{Enter}')

    expect(onSend).toHaveBeenCalledWith('Hello')
  })
})
