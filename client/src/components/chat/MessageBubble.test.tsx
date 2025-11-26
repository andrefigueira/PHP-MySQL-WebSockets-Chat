import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageBubble } from './MessageBubble'
import type { Message } from '@/types/chat'

const createMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  conversationId: 'general',
  userId: 'user-1',
  username: 'TestUser',
  content: 'Hello, World!',
  type: 'message',
  timestamp: '2024-01-15T10:30:00Z',
  ...overrides,
})

describe('MessageBubble', () => {
  it('renders message content', () => {
    const message = createMessage({ content: 'Test message content' })
    render(<MessageBubble message={message} isOwn={false} />)

    expect(screen.getByText('Test message content')).toBeInTheDocument()
  })

  it('renders username for non-own messages', () => {
    const message = createMessage({ username: 'JohnDoe' })
    render(<MessageBubble message={message} isOwn={false} />)

    expect(screen.getByText('JohnDoe')).toBeInTheDocument()
  })

  it('does not render username for own messages', () => {
    const message = createMessage({ username: 'JohnDoe' })
    render(<MessageBubble message={message} isOwn={true} />)

    expect(screen.queryByText('JohnDoe')).not.toBeInTheDocument()
  })

  it('renders avatar for non-own messages', () => {
    const message = createMessage({ username: 'John Doe' })
    render(<MessageBubble message={message} isOwn={false} />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('does not render avatar for own messages', () => {
    const message = createMessage({ username: 'John Doe' })
    render(<MessageBubble message={message} isOwn={true} />)

    expect(screen.queryByText('JD')).not.toBeInTheDocument()
  })

  it('renders system message differently', () => {
    const message = createMessage({
      type: 'system',
      content: 'User joined the chat',
    })
    render(<MessageBubble message={message} isOwn={false} />)

    expect(screen.getByText('User joined the chat')).toBeInTheDocument()
    expect(screen.queryByText('TestUser')).not.toBeInTheDocument()
  })

  it('renders timestamp', () => {
    const message = createMessage()
    render(<MessageBubble message={message} isOwn={false} />)

    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('handles long messages', () => {
    const longContent = 'A'.repeat(500)
    const message = createMessage({ content: longContent })
    render(<MessageBubble message={message} isOwn={false} />)

    expect(screen.getByText(longContent)).toBeInTheDocument()
  })

  it('handles special characters in content', () => {
    const message = createMessage({ content: '<script>alert("xss")</script>' })
    render(<MessageBubble message={message} isOwn={false} />)

    expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument()
  })
})
