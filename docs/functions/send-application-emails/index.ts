import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApplicationRecord {
  id: string;
  user_id: string;
  member_type: 'expert' | 'researcher';
  education: string;
  expertise_area: string;
  years_of_experience: number;
  motivation: string;
  website?: string;
  location?: string;
  status: string;
  created_at: string;
}

interface RequestBody {
  record: ApplicationRecord;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record }: RequestBody = await req.json()
    
    // Validate required environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const siteUrl = Deno.env.get('SITE_URL') || 'https://evidencedecoded.com'
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@healthintegrityproject.org'
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'Evidence Decoded <noreply@healthintegrityproject.org>'

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable')
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user profile and auth details
    const [profileResponse, userResponse] = await Promise.all([
      supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', record.user_id)
        .single(),
      supabase.auth.admin.getUserById(record.user_id)
    ])

    const profile = profileResponse.data
    const user = userResponse.data.user

    if (!user?.email) {
      throw new Error('User email not found')
    }

    const applicantName = profile?.display_name || 'there'
    const memberTypeCapitalized = record.member_type.charAt(0).toUpperCase() + record.member_type.slice(1)

    // Confirmation email for the applicant
    const confirmationEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application Received - Evidence Decoded</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { padding: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🎉 Application Received Successfully!</h2>
        </div>
        
        <div class="content">
            <p>Hi ${applicantName},</p>
            
            <p>Thank you for applying to become a <strong>${record.member_type}</strong> in the Evidence Decoded community!</p>
            
            <p>We've received your application and our team will review it carefully. Here's what happens next:</p>
            
            <ul>
                <li>📋 Our admin team will review your application within 3-5 business days</li>
                <li>✅ You'll receive an email notification with the decision</li>
                <li>🚀 If approved, you'll get access to expert features and community resources</li>
            </ul>
            
            <p><strong>Your Application Summary:</strong></p>
            <ul>
                <li><strong>Role:</strong> ${memberTypeCapitalized}</li>
                <li><strong>Expertise Area:</strong> ${record.expertise_area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                <li><strong>Experience:</strong> ${record.years_of_experience} years</li>
                ${record.location ? `<li><strong>Location:</strong> ${record.location}</li>` : ''}
                ${record.website ? `<li><strong>Website:</strong> <a href="${record.website}">${record.website}</a></li>` : ''}
            </ul>
            
            <a href="${siteUrl}/community" class="button">Visit Community</a>
            
            <p>If you have any questions, feel free to reach out to us.</p>
            
            <p>Best regards,<br>
            <strong>Evidence Decoded Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from Evidence Decoded. Please do not reply to this email.</p>
            <p>Visit us at <a href="${siteUrl}">${siteUrl}</a></p>
        </div>
    </div>
</body>
</html>
    `

    // Admin notification email
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New ${memberTypeCapitalized} Application - Evidence Decoded</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { padding: 20px 0; }
        .application-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        .urgent { background-color: #ffc107; color: #856404; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #495057; }
        .field-value { margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 New ${memberTypeCapitalized} Application Received</h2>
            <p>A new community member application requires your review.</p>
        </div>
        
        <div class="urgent">
            ⏱️ <strong>Action Required:</strong> Please review this application within 3-5 business days.
        </div>
        
        <div class="application-details">
            <h3>📋 Application Details</h3>
            
            <div class="field">
                <span class="field-label">👤 Applicant:</span>
                <span class="field-value">${applicantName} (${user.email})</span>
            </div>
            
            <div class="field">
                <span class="field-label">🎯 Role:</span>
                <span class="field-value">${memberTypeCapitalized}</span>
            </div>
            
            <div class="field">
                <span class="field-label">🧠 Expertise Area:</span>
                <span class="field-value">${record.expertise_area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            
            <div class="field">
                <span class="field-label">⏳ Years of Experience:</span>
                <span class="field-value">${record.years_of_experience} years</span>
            </div>
            
            ${record.location ? `
            <div class="field">
                <span class="field-label">📍 Location:</span>
                <span class="field-value">${record.location}</span>
            </div>
            ` : ''}
            
            ${record.website ? `
            <div class="field">
                <span class="field-label">🌐 Website:</span>
                <span class="field-value"><a href="${record.website}" target="_blank">${record.website}</a></span>
            </div>
            ` : ''}
            
            <div class="field">
                <span class="field-label">🎓 Education:</span>
                <div class="field-value" style="margin-top: 5px; padding: 10px; background-color: white; border-radius: 4px;">
                    ${record.education.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <div class="field">
                <span class="field-label">💭 Motivation:</span>
                <div class="field-value" style="margin-top: 5px; padding: 10px; background-color: white; border-radius: 4px;">
                    ${record.motivation.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <div class="field">
                <span class="field-label">📅 Applied:</span>
                <span class="field-value">${new Date(record.created_at).toLocaleString()}</span>
            </div>
            
            <div class="field">
                <span class="field-label">🆔 Application ID:</span>
                <span class="field-value">${record.id}</span>
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}/admin?tab=applications&highlight=${record.id}" class="button">
                🔍 Review Application in Admin Panel
            </a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px; color: #666;">
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Review the application details above</li>
                <li>Check the applicant's credentials and background</li>
                <li>Approve or reject the application in the admin panel</li>
                <li>The applicant will be notified automatically of your decision</li>
            </ol>
        </div>
    </div>
</body>
</html>
    `

    // Send confirmation email to applicant
    const confirmationResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject: `Application Received - Evidence Decoded ${memberTypeCapitalized} Program`,
        html: confirmationEmailHtml,
      }),
    })

    if (!confirmationResponse.ok) {
      const errorText = await confirmationResponse.text()
      throw new Error(`Failed to send confirmation email: ${errorText}`)
    }

    // Send notification to admin(s)
    const adminResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: `🔔 New ${memberTypeCapitalized} Application: ${applicantName}`,
        html: adminEmailHtml,
      }),
    })

    if (!adminResponse.ok) {
      const errorText = await adminResponse.text()
      console.error('Failed to send admin notification:', errorText)
      // Don't throw here - confirmation email succeeded
    }

    const confirmationResult = await confirmationResponse.json()
    const adminResult = adminResponse.ok ? await adminResponse.json() : null

    return new Response(
      JSON.stringify({ 
        success: true,
        confirmationEmailId: confirmationResult.id,
        adminEmailId: adminResult?.id,
        message: 'Application emails sent successfully'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in send-application-emails function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})