import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export function useClaimSubscription(claimId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['claim-subscription', claimId, user?.id]

  const enabled = !!user?.id && !!claimId

  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claim_subscriptions')
        .select('id')
        .eq('claim_id', claimId)
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled,
  })

  const isSubscribed = !!data
  const isLoading = enabled && isFetching && data === undefined

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('claim_subscriptions')
        .insert({ claim_id: claimId, user_id: user.id })
      if (error && error.code !== '23505') throw error // ignore unique violation
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, { id: 'optimistic' })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('claim_subscriptions')
        .delete()
        .eq('claim_id', claimId)
        .eq('user_id', user.id)
      if (error) throw error
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, null)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    isSubscribed,
    isLoading,
    subscribe: () => subscribeMutation.mutate(),
    unsubscribe: () => unsubscribeMutation.mutate(),
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
  }
}
