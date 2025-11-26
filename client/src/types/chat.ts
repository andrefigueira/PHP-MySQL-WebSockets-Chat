export interface Message {
  id: string
  conversationId: string
  userId: string
  username: string
  content: string
  type: 'message' | 'system'
  timestamp: string
}

export interface User {
  id: string
  username: string
}

export interface TypingIndicator {
  userId: string
  username: string
  isTyping: boolean
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface WebSocketMessage {
  type: string
  [key: string]: unknown
}

export interface ConnectedMessage extends WebSocketMessage {
  type: 'connected'
  clientId: string
  message: string
}

export interface IdentifiedMessage extends WebSocketMessage {
  type: 'identified'
  userId: string
  username: string
}

export interface JoinedMessage extends WebSocketMessage {
  type: 'joined'
  conversationId: string
}

export interface HistoryMessage extends WebSocketMessage {
  type: 'history'
  conversationId: string
  messages: Message[]
}

export interface TypingMessage extends WebSocketMessage {
  type: 'typing'
  userId: string
  username: string
  isTyping: boolean
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error'
  message: string
}
