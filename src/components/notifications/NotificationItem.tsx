import { FileText, FlaskConical, BarChart2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types/notifications'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

function typeIcon(type: NotificationType) {
  if (type === 'new_paper') return <FileText className="w-4 h-4 shrink-0 text-blue-400" aria-hidden="true" />
  if (type === 'new_review') return <FlaskConical className="w-4 h-4 shrink-0 text-purple-400" aria-hidden="true" />
  return <BarChart2 className="w-4 h-4 shrink-0 text-green-400" aria-hidden="true" />
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    onRead(notification.id)
    navigate(`/claims/${notification.claims?.slug ?? notification.claim_id}`)
  }

  return (
    <li role="listitem">
      <button
        onClick={handleClick}
        className={cn(
          'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors rounded-md',
          !notification.read && 'bg-white/[0.03]'
        )}
        aria-label={notification.message}
      >
        {typeIcon(notification.type)}
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm leading-snug line-clamp-2', !notification.read ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(notification.created_at)}</p>
        </div>
        {!notification.read && (
          <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
        )}
      </button>
    </li>
  )
}
