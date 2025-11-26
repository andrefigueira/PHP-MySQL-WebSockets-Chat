import { useEffect, useState } from 'react'
import { ChatProvider, useChat } from '@/context/ChatContext'
import { LoginForm } from '@/components/chat/LoginForm'
import { ChatRoom } from '@/components/chat/ChatRoom'

function ChatApp() {
  const { state, status, identify, join } = useChat()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (state.isIdentified && !state.isJoined) {
      join('general')
    }
  }, [state.isIdentified, state.isJoined, join])

  useEffect(() => {
    if (state.isJoined) {
      setIsLoggingIn(false)
    }
  }, [state.isJoined])

  const handleLogin = (username: string) => {
    setIsLoggingIn(true)
    identify(username)
  }

  if (!state.isJoined) {
    return (
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoggingIn || status === 'connecting'}
      />
    )
  }

  return <ChatRoom />
}

export function App() {
  return (
    <ChatProvider>
      <ChatApp />
    </ChatProvider>
  )
}
