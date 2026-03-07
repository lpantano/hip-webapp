import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useClaimSubscription } from '@/hooks/useClaimSubscription'
import { cn } from '@/lib/utils'

interface SubscribeButtonProps {
  claimId: string
  className?: string
}

export function SubscribeButton({ claimId, className }: SubscribeButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isSubscribed, isLoading, subscribe, unsubscribe, isSubscribing, isUnsubscribing } =
    useClaimSubscription(claimId)

  const handleClick = () => {
    if (!user) {
      navigate('/auth')
      return
    }
    if (isSubscribed) {
      unsubscribe()
    } else {
      subscribe()
    }
  }

  const isPending = isSubscribing || isUnsubscribing

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isSubscribed ? 'Unsubscribe from this claim' : 'Subscribe to this claim'}
      className={cn('flex items-center gap-2', className)}
    >
      {isSubscribed ? (
        <>
          <BellOff className="w-4 h-4" />
          <span className="hidden sm:inline">Unsubscribe</span>
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          <span className="hidden sm:inline">Subscribe</span>
        </>
      )}
    </Button>
  )
}
