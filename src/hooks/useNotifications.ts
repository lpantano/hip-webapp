import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Notification } from '@/types/notifications'

const PAGE_SIZE = 20

export function useNotifications(page = 0) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', user?.id, page],
    queryFn: async (): Promise<Notification[]> => {
      if (!user?.id) return []
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error } = await supabase
        .from('notifications')
        .select('id, claim_id, type, message, read, created_at, recipient_user_id, claims(title)')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      return (data ?? []) as Notification[]
    },
    enabled: !!user?.id,
    staleTime: 0,
  })
}

export function useUnreadNotificationCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_user_id', user.id)
        .eq('read', false)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!user?.id,
  })
}

export function useMarkNotificationRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('recipient_user_id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_user_id', user.id)
        .eq('read', false)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] })
    },
  })
}
