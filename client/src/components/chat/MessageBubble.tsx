import { memo } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, formatTime, getAvatarColor, getInitials } from '@/lib/utils'
import type { Message } from '@/types/chat'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
}: MessageBubbleProps) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-slate-700/50 px-3 py-1 text-xs text-slate-400">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn('flex items-end gap-2 py-1', isOwn && 'flex-row-reverse')}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarFallback
            className={cn('text-xs text-white', getAvatarColor(message.userId))}
          >
            {getInitials(message.username)}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex max-w-[70%] flex-col',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {!isOwn && (
          <span className="mb-1 text-xs font-medium text-slate-400">
            {message.username}
          </span>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : 'bg-slate-700 text-slate-100'
          )}
        >
          <p className="break-words text-sm">{message.content}</p>
        </div>

        <span className="mt-1 text-xs text-slate-500">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
})
