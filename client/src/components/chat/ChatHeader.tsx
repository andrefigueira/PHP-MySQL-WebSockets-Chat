import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn, getAvatarColor, getInitials } from '@/lib/utils'
import type { ConnectionStatus, User } from '@/types/chat'
import { LogOut, MessageCircle } from 'lucide-react'

interface ChatHeaderProps {
  user: User
  conversationId: string
  status: ConnectionStatus
  onDisconnect: () => void
}

const statusConfig: Record<ConnectionStatus, { label: string; color: string }> = {
  connected: { label: 'Connected', color: 'bg-green-500' },
  connecting: { label: 'Connecting...', color: 'bg-yellow-500' },
  disconnected: { label: 'Disconnected', color: 'bg-red-500' },
  error: { label: 'Error', color: 'bg-red-500' },
}

export function ChatHeader({
  user,
  conversationId,
  status,
  onDisconnect,
}: ChatHeaderProps) {
  const { label, color } = statusConfig[status]

  return (
    <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-white">
            #{conversationId}
          </h1>
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', color)} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className={cn('text-xs text-white', getAvatarColor(user.id))}
            >
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-300">
            {user.username}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDisconnect}
          className="text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
