# Email Notification System for Community Applications

This document outlines the setup and dependencies required for the automated email notification system that sends confirmation emails to applicants and notifications to admins when someone submits a community application (expert or researcher).

## Overview

The system uses:
- **Supabase Edge Functions** to send emails
- **Resend** as the email service provider
- **Database triggers** to automatically send emails after successful application submissions

## Prerequisites & Dependencies

### 1. Email Service Provider (Resend)

**Why Resend?**
- Excellent deliverability rates
- Simple API
- Generous free tier (3,000 emails/month)
- Good reputation management
- Modern developer experience

**Setup Steps:**

1. **Create a Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account
   - Verify your email address

2. **Generate API Key**
   - Navigate to the API Keys section in your Resend dashboard
   - Click "Create API Key"
   - Name it "Evidence Decoded Production" (or similar)
   - Copy the API key (starts with `re_`)
   - **Important**: Save this key securely - you won't be able to see it again

3. **Set up Domain (Optional but Recommended)**
   - Add your domain (e.g., `evidencedecoded.com`) in the Domains section
   - Add the required DNS records to your domain provider
   - Verify the domain
   - This allows you to send emails from `@yourdomain.com` instead of `@resend.dev`

### 2. Platform Email Addresses

You'll need to set up the following email addresses:

**Required Emails:**
- `noreply@healthintegrityproject.org` - For sending automated confirmations
- `admin@healthintegrityproject.org` - Receives application notifications
- `applications@healthintegrityproject.org` - Alternative sender for admin notifications

**Optional Emails:**
- `support@healthintegrityproject.org` - For user inquiries mentioned in emails
- `hello@healthintegrityproject.org` - General contact

### 3. Supabase Environment Variables

Add these environment variables in your Supabase project settings:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_actual_api_key_here

# Email Addresses
ADMIN_EMAIL=admin@healthintegrityproject.org
FROM_EMAIL=Evidence Decoded <noreply@healthintegrityproject.org>

# Site Configuration
SITE_URL=https://yourdomain.com

# Supabase (usually already set)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**How to add environment variables in Supabase:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Scroll down to "Project API keys"
4. Add the variables in the Edge Functions section

### 4. Domain DNS Configuration (If using custom domain with Resend)

Add these DNS records to your domain provider:

```
Type: TXT
Name: @
Value: resend-verification=your_verification_code

Type: MX
Name: @
Value: mx.resend.com
Priority: 10

Type: TXT  
Name: @
Value: "v=spf1 include:_spf.resend.com ~all"

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

## Installation & Deployment

### 1. Deploy the Edge Function

```bash
# Navigate to your project directory
cd /path/to/your/project

# Make sure you have Supabase CLI installed and logged in
npx supabase login

# Deploy the function
npx supabase functions deploy send-application-emails

# Verify deployment
npx supabase functions list
```

### 2. Set up Database Trigger (Optional - for automatic emails)

Create a new migration file:

```bash
npx supabase migration new add_application_email_trigger
```

Add this SQL to the migration file:

```sql
-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create function to send application notification
CREATE OR REPLACE FUNCTION send_application_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function asynchronously
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-application-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object('record', row_to_json(NEW))::text
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after expert application insert
CREATE TRIGGER after_expert_application_insert
  AFTER INSERT ON experts
  FOR EACH ROW
  EXECUTE FUNCTION send_application_notification();
```

Apply the migration:

```bash
npx supabase db push
```

### 3. Test the System

You can test the email function directly:

```bash
# Test the function with sample data
npx supabase functions invoke send-application-emails --data '{
  "record": {
    "id": "test-id",
    "user_id": "test-user-id",
    "member_type": "expert",
    "education": "PhD in Nutrition Science",
    "expertise_area": "nutrition",
    "years_of_experience": 5,
    "motivation": "I want to help people make better health decisions",
    "website": "https://example.com",
    "location": "New York, NY",
    "status": "pending",
    "created_at": "2025-10-07T12:00:00Z"
  }
}'
```

## Email Templates

The system sends two types of emails:

### 1. Confirmation Email (to applicant)
- **Subject**: "Application Received - Evidence Decoded [Expert/Researcher] Program"
- **Content**: Welcome message, application summary, next steps
- **Tone**: Friendly and professional

### 2. Admin Notification Email (to admins)
- **Subject**: "🔔 New [Expert/Researcher] Application: [Name]"
- **Content**: Full application details, review link
- **Tone**: Professional and actionable

## Monitoring & Troubleshooting

### 1. Check Function Logs

```bash
# View recent function logs
npx supabase functions logs send-application-emails

# Follow logs in real-time
npx supabase functions logs send-application-emails --follow
```

### 2. Check Resend Dashboard

- Monitor email delivery status
- View bounce and complaint rates
- Check sending volume and limits

### 3. Common Issues

**Emails not being sent:**
1. Check RESEND_API_KEY is correct
2. Verify domain is properly configured
3. Check function logs for errors
4. Ensure user has valid email address

**Emails going to spam:**
1. Set up domain authentication (SPF, DKIM)
2. Warm up your domain gradually
3. Monitor bounce rates
4. Use consistent sender information

**Function errors:**
1. Check all environment variables are set
2. Verify Supabase service role key permissions
3. Check network connectivity to Resend API

## Cost Considerations

### Resend Pricing (as of 2025)
- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Pro Tier**: $20/month for 50,000 emails
- **Business Tier**: $85/month for 200,000 emails

### Estimated Usage
- **Community applications**: ~50-200/month
- **Other notifications**: Variable
- **Total estimated**: Well within free tier initially

## Security Best Practices

1. **API Key Management**
   - Store API keys only in Supabase environment variables
   - Never commit API keys to version control
   - Rotate keys periodically

2. **Email Content**
   - Sanitize user input in email templates
   - Validate email addresses before sending
   - Rate limit email sending if needed

3. **Domain Security**
   - Set up proper SPF/DKIM records
   - Monitor for domain reputation issues
   - Use dedicated sending domains

## Future Enhancements

1. **Email Templates**
   - Create reusable HTML templates
   - Add personalization variables
   - Support multiple languages

2. **Analytics**
   - Track open and click rates
   - Monitor delivery success
   - A/B test email content

3. **Additional Notifications**
   - Application status updates
   - Welcome emails for approved experts
   - Regular community newsletters

## Support

If you encounter issues:

1. Check the function logs first
2. Verify all environment variables
3. Test with a simple email send
4. Contact Resend support for delivery issues
5. Check Supabase documentation for Edge Functions

## Quick Setup Checklist

- [ ] Create Resend account and get API key
- [ ] Set up email addresses for your domain
- [ ] Add environment variables to Supabase
- [ ] Deploy the Edge Function
- [ ] Create and apply database trigger migration
- [ ] Test with sample application
- [ ] Monitor first few real applications
- [ ] Set up domain authentication (optional but recommended)