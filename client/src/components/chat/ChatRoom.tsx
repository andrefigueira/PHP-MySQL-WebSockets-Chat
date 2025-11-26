import { useMemo } from 'react'
import { useChat } from '@/context/ChatContext'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

export function ChatRoom() {
  const { state, status, sendMessage, sendTyping, disconnect } = useChat()

  const typingUsernames = useMemo(() => {
    return Array.from(state.typingUsers.values())
      .filter((t) => t.userId !== state.user?.id)
      .map((t) => t.username)
  }, [state.typingUsers, state.user?.id])

  if (!state.user) {
    return null
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ChatHeader
        user={state.user}
        conversationId={state.conversationId}
        status={status}
        onDisconnect={disconnect}
      />

      <MessageList
        messages={state.messages}
        currentUserId={state.user.id}
        typingUsers={typingUsernames}
      />

      <MessageInput
        onSend={sendMessage}
        onTyping={sendTyping}
        disabled={status !== 'connected'}
      />
    </div>
  )
}
