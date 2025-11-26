import { describe, expect, it } from 'vitest'
import { cn, formatTime, generateUserId, getAvatarColor, getInitials } from './utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })
})

describe('formatTime', () => {
  it('formats Date object correctly', () => {
    const date = new Date('2024-01-15T10:30:00')
    const result = formatTime(date)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('formats string date correctly', () => {
    const result = formatTime('2024-01-15T14:45:00')
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})

describe('generateUserId', () => {
  it('generates a user ID with correct prefix', () => {
    const userId = generateUserId()
    expect(userId).toMatch(/^user_[a-z0-9]+$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUserId()))
    expect(ids.size).toBe(100)
  })
})

describe('getInitials', () => {
  it('returns initials for single word', () => {
    expect(getInitials('John')).toBe('J')
  })

  it('returns initials for two words', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('limits to two characters', () => {
    expect(getInitials('John Michael Doe')).toBe('JM')
  })

  it('handles empty string', () => {
    expect(getInitials('')).toBe('')
  })

  it('returns uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })
})

describe('getAvatarColor', () => {
  it('returns a valid tailwind color class', () => {
    const color = getAvatarColor('user-123')
    expect(color).toMatch(/^bg-\w+-500$/)
  })

  it('returns consistent color for same userId', () => {
    const color1 = getAvatarColor('user-abc')
    const color2 = getAvatarColor('user-abc')
    expect(color1).toBe(color2)
  })

  it('returns different colors for different userIds', () => {
    const colors = new Set(
      ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'].map(getAvatarColor)
    )
    expect(colors.size).toBeGreaterThan(1)
  })
})
