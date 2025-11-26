import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('renders login form with input and button', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Join Chat' })).toBeInTheDocument()
  })

  it('displays app title', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    expect(screen.getByText('WebSocket Chat')).toBeInTheDocument()
  })

  it('submit button is disabled when input is empty', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    const button = screen.getByRole('button', { name: 'Join Chat' })
    expect(button).toBeDisabled()
  })

  it('submit button is enabled when input has value', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={vi.fn()} />)

    const input = screen.getByPlaceholderText('Username')
    await user.type(input, 'TestUser')

    const button = screen.getByRole('button', { name: 'Join Chat' })
    expect(button).toBeEnabled()
  })

  it('calls onSubmit with username when form is submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText('Username')
    await user.type(input, 'TestUser')

    const button = screen.getByRole('button', { name: 'Join Chat' })
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledWith('TestUser')
  })

  it('trims whitespace from username', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText('Username')
    await user.type(input, '  TestUser  ')

    const button = screen.getByRole('button', { name: 'Join Chat' })
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledWith('TestUser')
  })

  it('does not submit when username is only whitespace', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText('Username')
    await user.type(input, '   ')

    const button = screen.getByRole('button', { name: 'Join Chat' })
    expect(button).toBeDisabled()
  })

  it('shows loading state when isLoading is true', () => {
    render(<LoginForm onSubmit={vi.fn()} isLoading />)

    expect(screen.getByRole('button', { name: 'Connecting...' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Username')).toBeDisabled()
  })

  it('disables button when loading', () => {
    render(<LoginForm onSubmit={vi.fn()} isLoading />)

    const button = screen.getByRole('button', { name: 'Connecting...' })
    expect(button).toBeDisabled()
  })
})
