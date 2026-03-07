import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NotificationItem } from './NotificationItem'
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/useNotifications'

export function NotificationInbox() {
  const [page, setPage] = useState(0)
  const { data: notifications, isLoading, isError, refetch } = useNotifications(page)
  const markAllRead = useMarkAllNotificationsRead()
  const markRead = useMarkNotificationRead()

  const hasUnread = notifications?.some((n) => !n.read) ?? false

  if (isLoading) {
    return (
      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
        Loading notifications…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">Unable to load notifications.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
        No notifications yet. Subscribe to a claim to get updates.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notifications</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          disabled={!hasUnread || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          Mark all as read
        </Button>
      </div>
      <ul role="list" className="max-h-[400px] overflow-y-auto py-1">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={(id) => markRead.mutate(id)}
          />
        ))}
      </ul>
      {notifications.length === (page + 1) * 20 && (
        <div className="px-4 py-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setPage((p) => p + 1)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
