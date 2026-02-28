export type NotificationType = 'new_paper' | 'new_review' | 'status_changed'

export interface Notification {
  id: string
  recipient_user_id: string
  claim_id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: string
  claims?: { title: string }
}

export interface ClaimSubscription {
  id: string
  user_id: string
  claim_id: string
  created_at: string
}
