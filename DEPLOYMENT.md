# R U OK? - Deployment Guide

This guide will help you deploy the Employee Wellbeing Tracking application to Vercel.

## Features

- **Manager Dashboard**: Track employee wellbeing across your organization
- **Group Management**: Organize employees into groups for detailed analytics
- **Daily Email Notifications**: Automatic emails sent at 4pm daily
- **Employee Response Interface**: Simple Green/Amber/Red status with optional comments
- **Real-time Analytics**: View trends and patterns in employee wellbeing
- **Privacy Options**: Anonymous responses for employee comfort

## Prerequisites

1. A Vercel account (free tier works)
2. A Convex account (free tier works)
3. An email service account (Resend or SendGrid recommended)

## Step 1: Convex Setup

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Create a new project
3. Copy your deployment URL and API key
4. Install Convex CLI (if not already installed):
   ```bash
   npm install -g convex
   ```
5. Login to Convex:
   ```bash
   npx convex login
   ```
6. Deploy Convex functions:
   ```bash
   npx convex deploy
   ```

## Step 2: Email Service Setup

### Option 1: Resend (Recommended for Vercel)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain for development)
3. Create an API key
4. Copy the API key for later use

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key with "Mail Send" permissions
3. Verify your sender email
4. Copy the API key for later use

## Step 3: Vercel Deployment

1. **Push your code to GitHub** (if not already done)

2. **Import project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Environment Variables**:
   Add the following environment variables in Vercel:

   ```
   # Convex
   CONVEX_DEPLOYMENT=your-convex-deployment
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

   # App URL (will be your Vercel URL)
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

   # Email Service (Resend)
   RESEND_API_KEY=re_your_api_key
   EMAIL_FROM=noreply@yourdomain.com

   # OR if using SendGrid
   # SENDGRID_API_KEY=SG.your_api_key
   # EMAIL_FROM=noreply@yourdomain.com

   # Cron Security (generate a random string)
   CRON_SECRET=your_random_secret_here_use_something_long_and_random
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

5. **Update NEXT_PUBLIC_APP_URL**:
   - After deployment, copy your Vercel URL
   - Update the `NEXT_PUBLIC_APP_URL` environment variable with your actual Vercel URL
   - Redeploy if necessary

## Step 4: Verify Cron Job Setup

The cron job is configured in `vercel.json` to run daily at 4pm UTC:

```json
{
  "crons": [
    {
      "path": "/api/send-daily-emails",
      "schedule": "0 16 * * *"
    }
  ]
}
```

**Note**: Cron jobs on Vercel require a Pro plan. For the free tier, you can:
- Use an external cron service like [cron-job.org](https://cron-job.org)
- Use GitHub Actions to trigger the endpoint
- Manually trigger emails via the API endpoint

### Manual Email Testing

You can test the email system by calling the endpoint manually:

```bash
curl -X POST https://your-app.vercel.app/api/send-daily-emails \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Step 5: Testing the Application

1. **Create a Manager Account**:
   - Visit `https://your-app.vercel.app/manager/register`
   - Fill in your details and organization information
   - Add employee emails

2. **Test Employee Response**:
   - Since emails will only be sent via cron, you can manually create a token:
   - Or trigger the send-daily-emails endpoint manually
   - Employees will receive an email with a link to submit their response

3. **View Dashboard**:
   - Login as manager
   - View organization-wide and group analytics
   - Manage employees and groups

## Timezone Configuration

The cron job runs at 4pm UTC by default. To change this:

1. Edit `vercel.json` and update the schedule:
   ```json
   "schedule": "0 16 * * *"  // Change 16 to your preferred hour (UTC)
   ```

2. Common timezones:
   - 4pm EST (9pm UTC): `"schedule": "0 21 * * *"`
   - 4pm PST (12am UTC next day): `"schedule": "0 0 * * *"`
   - 4pm GMT (4pm UTC): `"schedule": "0 16 * * *"`

## Troubleshooting

### Emails not sending

1. Check that your email service API key is correctly set in Vercel environment variables
2. Check that EMAIL_FROM is a verified sender in your email service
3. Check Vercel function logs for error messages
4. Test the endpoint manually with curl

### Convex errors

1. Ensure NEXT_PUBLIC_CONVEX_URL is correct and includes https://
2. Run `npx convex deploy` to ensure all functions are deployed
3. Check Convex dashboard for function errors

### Cron job not running

1. Verify you have Vercel Pro plan (required for cron jobs)
2. Check Vercel dashboard → Project → Cron Jobs to see execution logs
3. As alternative, use external cron service to hit the API endpoint

## Security Considerations

1. **CRON_SECRET**: Make this a long, random string. This prevents unauthorized access to the email endpoint.
2. **Password Hashing**: The current implementation uses plain text passwords. For production, implement proper password hashing (bcrypt).
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse.
4. **Email Validation**: The system validates email formats but doesn't verify ownership.

## Scaling Considerations

- Convex free tier: 1GB storage, 1M reads/month, 1M writes/month
- Vercel free tier: 100GB bandwidth, 100 serverless function executions/day
- Resend free tier: 3,000 emails/month
- SendGrid free tier: 100 emails/day

For larger organizations, consider upgrading to paid tiers.

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Check Convex dashboard for backend errors
3. Review browser console for frontend errors

## License

This project is provided as-is for employee wellbeing tracking purposes.
