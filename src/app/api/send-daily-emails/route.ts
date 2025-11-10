import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// Define types for the data structures
type Organization = {
  _id: Id<'organizations'>
  name: string
  managerId: Id<'managers'>
  createdAt: number
}

type Employee = {
  _id: Id<'employees'>
  email: string
  organizationId: Id<'organizations'>
  groupId?: Id<'groups'>
  createdAt: number
  isActive: boolean
}

type TokenResult = {
  tokenId: Id<'emailTokens'>
  token: string
}

// Helper to get Convex client
function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not set')
  }
  return new ConvexHttpClient(url)
}

// This endpoint should be called by a cron job daily at 4pm
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a valid source (cron job)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? ''}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const convex = getConvexClient()

    // Get all organizations
    const organizations = await convex.query(api.users.getAllOrganizations) as Organization[]

    let totalEmailsSent = 0
    const errors: string[] = []

    // For each organization, get all active employees and send emails
    for (const org of organizations) {
      try {
        const employees = await convex.query(api.users.getEmployeesByOrganization, {
          organizationId: org._id,
        }) as Employee[]

        for (const employee of employees) {
          try {
            // Generate token for this employee
            const tokenResult = await convex.mutation(api.users.generateEmailToken, {
              employeeId: employee._id,
            }) as TokenResult

            // Construct response URL
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
            const responseUrl = `${appUrl}/employee/respond?token=${tokenResult.token}`

            // Send email using your preferred email service
            // This is a template - replace with actual email service
            await sendEmail({
              to: employee.email,
              subject: 'R U OK? - Daily Check-in',
              html: generateEmailHTML(responseUrl, org.name),
            })

            totalEmailsSent++
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err)
            errors.push(`Failed to send to ${employee.email}: ${errorMessage}`)
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        errors.push(`Failed to process organization ${org.name}: ${errorMessage}`)
      }
    }

    return NextResponse.json({
      success: true,
      totalEmailsSent,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error sending daily emails:', error)
    return NextResponse.json(
      { error: 'Failed to send emails', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Helper function to send email
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Option 1: Using Resend (recommended for Vercel)
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? 'noreply@yourdomain.com',
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    return (await response.json()) as { id: string }
  }

  // Option 2: Using SendGrid
  if (process.env.SENDGRID_API_KEY) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.EMAIL_FROM ?? 'noreply@yourdomain.com' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    return { success: true }
  }

  // If no email service is configured, log the email (for development)
  console.log('Email would be sent:', { to, subject })
  console.log('Email HTML:', html)

  return { success: true, dev: true }
}

// Generate email HTML
function generateEmailHTML(responseUrl: string, organizationName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>R U OK? - Daily Check-in</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">R U OK?</h1>
              <p style="margin: 10px 0 0; color: #dbeafe; font-size: 16px;">Daily Wellbeing Check-in</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi there,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                It's time for your daily check-in. How was your day today?
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Please take a moment to let us know how you're doing by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${responseUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Submit Your Response
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Your response will help ${organizationName} create a better work environment for everyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                This link is valid for 48 hours
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                ${organizationName} - Wellbeing Tracking
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer Text -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td style="text-align: center; padding: 0 20px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${responseUrl}" style="color: #2563eb; word-break: break-all;">${responseUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
