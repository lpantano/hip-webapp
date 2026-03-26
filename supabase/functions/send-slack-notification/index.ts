import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type EventType = 'new_claim' | 'new_publication' | 'new_review'

interface ClaimRecord {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  evidence_status: string | null
  created_at: string
}

interface PublicationRecord {
  id: string
  claim_id: string
  title: string
  journal: string
  publication_year: number
  stance: string | null
  submitted_by: string | null
  created_at: string
}

interface ReviewRecord {
  id: string
  publication_id: string
  expert_user_id: string
  comments: string | null
  created_at: string
}

interface RequestBody {
  event_type: EventType
  record: ClaimRecord | PublicationRecord | ReviewRecord
  // Enriched fields passed from DB triggers
  claim_title?: string
  claim_id?: string
  publication_title?: string
}

const SITE_URL = Deno.env.get('SITE_URL') || 'https://healthintegrityproject.org'

function stanceEmoji(stance: string | null): string {
  switch (stance) {
    case 'supporting':    return ':white_check_mark:'
    case 'contradicting': return ':x:'
    case 'neutral':       return ':white_circle:'
    case 'mixed':         return ':large_yellow_circle:'
    default:              return ':grey_question:'
  }
}

function buildNewClaimPayload(record: ClaimRecord): Record<string, unknown> {
  const evidenceStatus = record.evidence_status || 'Awaiting Evidence'
  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: ':bulb: New Claim Added', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Title*\n${record.title}` },
          { type: 'mrkdwn', text: `*Category*\n${record.category}` },
          { type: 'mrkdwn', text: `*Evidence Status*\n${evidenceStatus}` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Claim', emoji: true },
            url: `${SITE_URL}/claims/${record.id}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Submitted <!date^${Math.floor(new Date(record.created_at).getTime() / 1000)}^{date_short_pretty} at {time}|${record.created_at}>`,
          },
        ],
      },
    ],
  }
}

function buildNewPublicationPayload(record: PublicationRecord, claimTitle: string | undefined): Record<string, unknown> {
  const stanceText = record.stance
    ? `${stanceEmoji(record.stance)} ${record.stance}`
    : ':grey_question: Unknown'

  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: ':page_facing_up: New Paper Submitted', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Title*\n${record.title}` },
          { type: 'mrkdwn', text: `*Journal*\n${record.journal} (${record.publication_year})` },
          { type: 'mrkdwn', text: `*Stance*\n${stanceText}` },
          { type: 'mrkdwn', text: `*Linked Claim*\n${claimTitle || record.claim_id}` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Claim', emoji: true },
            url: `${SITE_URL}/claims/${record.claim_id}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Submitted <!date^${Math.floor(new Date(record.created_at).getTime() / 1000)}^{date_short_pretty} at {time}|${record.created_at}>`,
          },
        ],
      },
    ],
  }
}

function buildNewReviewPayload(
  record: ReviewRecord,
  publicationTitle: string | undefined,
  claimId: string | undefined,
  claimTitle: string | undefined,
): Record<string, unknown> {
  const comments = record.comments
    ? record.comments.slice(0, 200) + (record.comments.length > 200 ? '…' : '')
    : 'No comments'

  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: ':microscope: New Expert Review', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Paper*\n${publicationTitle || record.publication_id}` },
          { type: 'mrkdwn', text: `*Claim*\n${claimTitle || claimId || 'Unknown'}` },
          { type: 'mrkdwn', text: `*Comments*\n${comments}` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Claim', emoji: true },
            url: `${SITE_URL}/claims/${claimId || ''}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Reviewed <!date^${Math.floor(new Date(record.created_at).getTime() / 1000)}^{date_short_pretty} at {time}|${record.created_at}>`,
          },
        ],
      },
    ],
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')

    if (!slackWebhookUrl) {
      console.warn('SLACK_WEBHOOK_URL is not set — skipping Slack notification')
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: 'SLACK_WEBHOOK_URL not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const body: RequestBody = await req.json()
    const { event_type, record, claim_title, claim_id, publication_title } = body

    let payload: Record<string, unknown>

    switch (event_type) {
      case 'new_claim':
        payload = buildNewClaimPayload(record as ClaimRecord)
        break
      case 'new_publication':
        payload = buildNewPublicationPayload(record as PublicationRecord, claim_title)
        break
      case 'new_review':
        payload = buildNewReviewPayload(record as ReviewRecord, publication_title, claim_id, claim_title)
        break
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown event_type: ${event_type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }

    const slackResponse = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text()
      console.error(`Slack webhook error (${slackResponse.status}): ${errorText}`)
      return new Response(
        JSON.stringify({ success: false, error: `Slack returned ${slackResponse.status}: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ success: true, event_type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in send-slack-notification:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
