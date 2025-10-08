# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Evidence Decoded platform.

## Functions

### send-application-emails

Automatically sends confirmation emails to applicants and notification emails to administrators when community applications (expert/researcher) are submitted.

**Triggers:**
- Database trigger on `experts` table insert
- Manual invocation from frontend (backup method)

**Dependencies:**
- Resend API for email delivery
- Environment variables for configuration

**Files:**
- `send-application-emails/index.ts` - Main function code

## Development

### Local Testing

```bash
# Start Supabase local development
npx supabase start

# Deploy functions locally
npx supabase functions deploy send-application-emails --no-verify-jwt

# Test function
npx supabase functions invoke send-application-emails --data '{"record": {...}}'
```

### Deployment

```bash
# Deploy to production
npx supabase functions deploy send-application-emails

# View logs
npx supabase functions logs send-application-emails
```

## Configuration

Required environment variables in Supabase:
- `RESEND_API_KEY` - Resend API key for sending emails
- `ADMIN_EMAIL` - Email address to receive admin notifications
- `FROM_EMAIL` - Sender email address
- `SITE_URL` - Base URL of the website

## Documentation

See `/docs/email-notifications-setup.md` for complete setup instructions.