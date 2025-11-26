import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import type {
  ConnectionStatus,
  Message,
  TypingIndicator,
  User,
  WebSocketMessage,
} from '@/types/chat'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

interface ChatState {
  user: User | null
  messages: Message[]
  typingUsers: Map<string, TypingIndicator>
  conversationId: string
  isIdentified: boolean
  isJoined: boolean
}

type ChatAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_IDENTIFIED'; payload: boolean }
  | { type: 'SET_JOINED'; payload: { conversationId: string } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_TYPING'; payload: TypingIndicator }
  | { type: 'CLEAR_TYPING'; payload: string }
  | { type: 'RESET' }

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_IDENTIFIED':
      return { ...state, isIdentified: action.payload }
    case 'SET_JOINED':
      return {
        ...state,
        isJoined: true,
        conversationId: action.payload.conversationId,
      }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    case 'SET_TYPING': {
      const newTypingUsers = new Map(state.typingUsers)
      if (action.payload.isTyping) {
        newTypingUsers.set(action.payload.userId, action.payload)
      } else {
        newTypingUsers.delete(action.payload.userId)
      }
      return { ...state, typingUsers: newTypingUsers }
    }
    case 'CLEAR_TYPING': {
      const newTypingUsers = new Map(state.typingUsers)
      newTypingUsers.delete(action.payload)
      return { ...state, typingUsers: newTypingUsers }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const initialState: ChatState = {
  user: null,
  messages: [],
  typingUsers: new Map(),
  conversationId: 'general',
  isIdentified: false,
  isJoined: false,
}

interface ChatContextValue {
  state: ChatState
  status: ConnectionStatus
  identify: (username: string) => void
  join: (conversationId?: string) => void
  sendMessage: (content: string) => void
  sendTyping: (isTyping: boolean) => void
  disconnect: () => void
  reconnect: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const handleMessage = useCallback((data: WebSocketMessage) => {
    switch (data.type) {
      case 'connected':
        break

      case 'identified':
        dispatch({
          type: 'SET_USER',
          payload: {
            id: data.userId as string,
            username: data.username as string,
          },
        })
        dispatch({ type: 'SET_IDENTIFIED', payload: true })
        break

      case 'joined':
        dispatch({
          type: 'SET_JOINED',
          payload: { conversationId: data.conversationId as string },
        })
        break

      case 'history':
        dispatch({
          type: 'SET_MESSAGES',
          payload: data.messages as Message[],
        })
        break

      case 'message':
      case 'system':
        dispatch({
          type: 'ADD_MESSAGE',
          payload: data as unknown as Message,
        })
        break

      case 'typing':
        dispatch({
          type: 'SET_TYPING',
          payload: {
            userId: data.userId as string,
            username: data.username as string,
            isTyping: data.isTyping as boolean,
          },
        })
        break

      case 'error':
        console.error('Server error:', data.message)
        break
    }
  }, [])

  const handleClose = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const { status, send, disconnect, reconnect } = useWebSocket({
    url: WS_URL,
    onMessage: handleMessage,
    onClose: handleClose,
  })

  const identify = useCallback(
    (username: string) => {
      send({
        action: 'identify',
        username,
      })
    },
    [send]
  )

  const join = useCallback(
    (conversationId = 'general') => {
      send({
        action: 'join',
        conversationId,
      })
    },
    [send]
  )

  const sendMessage = useCallback(
    (content: string) => {
      if (!state.user) return

      const message: Message = {
        id: crypto.randomUUID(),
        conversationId: state.conversationId,
        userId: state.user.id,
        username: state.user.username,
        content,
        type: 'message',
        timestamp: new Date().toISOString(),
      }

      dispatch({ type: 'ADD_MESSAGE', payload: message })

      send({
        action: 'message',
        content,
      })
    },
    [send, state.user, state.conversationId]
  )

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      send({
        action: 'typing',
        isTyping,
      })
    },
    [send]
  )

  const value = useMemo<ChatContextValue>(
    () => ({
      state,
      status,
      identify,
      join,
      sendMessage,
      sendTyping,
      disconnect,
      reconnect,
    }),
    [state, status, identify, join, sendMessage, sendTyping, disconnect, reconnect]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
