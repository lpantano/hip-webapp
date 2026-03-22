import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { useNotificationsRealtime } from '@/hooks/useNotificationsRealtime'
import { NotificationInbox } from './NotificationInbox'

export function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  useNotificationsRealtime()

  const label = unreadCount > 0
    ? `Notifications, ${unreadCount} unread`
    : 'Notifications'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:text-white/80 hover:bg-white/10"
          aria-label={label}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none"
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        <NotificationInbox />
      </PopoverContent>
    </Popover>
  )
}
