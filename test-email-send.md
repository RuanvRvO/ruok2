# Testing Daily Email Send Functionality

## Prerequisites

1. **Start your development servers:**
   ```bash
   # Terminal 1: Start Convex
   npx convex dev

   # Terminal 2: Start Next.js
   npm run dev
   ```

2. **Ensure you have these in `.env.local`:**
   ```bash
   CRON_SECRET=your-secret-here-generate-random-string
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

   # Optional: Email service (if not set, emails will be logged to console)
   RESEND_API_KEY=your-resend-api-key
   # OR
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

---

## Method 1: Using Node Test Script (Easiest)

```bash
node test-email-send.js
```

This will:
- ✅ Automatically read your CRON_SECRET from .env.local
- ✅ Send request to your local dev server
- ✅ Show detailed results
- ✅ Display any errors

---

## Method 2: Using cURL

### Windows (PowerShell):
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_CRON_SECRET_HERE"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/send-daily-emails" -Method POST -Headers $headers
```

### Windows (CMD) or Git Bash:
```bash
curl -X POST http://localhost:3000/api/send-daily-emails \
  -H "Authorization: Bearer YOUR_CRON_SECRET_HERE" \
  -H "Content-Type: application/json"
```

---

## Method 3: Using Postman or Insomnia

1. **Create a new POST request**
2. **URL:** `http://localhost:3000/api/send-daily-emails`
3. **Headers:**
   - `Authorization`: `Bearer YOUR_CRON_SECRET_HERE`
   - `Content-Type`: `application/json`
4. **Click Send**

---

## Method 4: Using VS Code REST Client Extension

Create a file `test-email.http`:

```http
### Test Daily Email Send
POST http://localhost:3000/api/send-daily-emails
Authorization: Bearer YOUR_CRON_SECRET_HERE
Content-Type: application/json
```

Click "Send Request" above the POST line.

---

## What to Expect

### ✅ Success Response:
```json
{
  "success": true,
  "totalEmailsSent": 5,
  "errors": []
}
```

### ⚠️ With Some Errors:
```json
{
  "success": true,
  "totalEmailsSent": 3,
  "errors": [
    "Failed to send to employee@example.com: Invalid email address"
  ]
}
```

### ❌ Auth Error (401):
```json
{
  "error": "Unauthorized"
}
```
**Fix:** Check your CRON_SECRET is correct

### ❌ Server Error (500):
```json
{
  "error": "Failed to send emails",
  "details": "NEXT_PUBLIC_CONVEX_URL environment variable is not set"
}
```
**Fix:** Make sure Convex is running and environment variables are set

---

## Checking the Results

### 1. **Console Logs (Development)**
If no email service is configured, emails will be logged to your terminal where `npm run dev` is running:

```
Email would be sent: { to: 'employee@example.com', subject: 'R U OK? - Daily Check-in' }
Email HTML: <!DOCTYPE html>...
```

### 2. **Check Your Inbox**
If you configured Resend or SendGrid, check the employee email addresses for the check-in email.

### 3. **Test the Response Link**
Copy the URL from the email or console log and test it:
```
http://localhost:3000/employee/respond?token=abc123...
```

Should show the employee response form.

---

## Troubleshooting

### Problem: "Unauthorized" Error
**Solution:** Check your CRON_SECRET matches in:
- `.env.local` file
- Your test request

### Problem: "No organizations found"
**Solution:** Create a manager account and organization first:
1. Go to http://localhost:3000/manager/register
2. Create an organization with employee emails
3. Run the email send test again

### Problem: "Convex deployment URL not set"
**Solution:**
1. Make sure Convex is running: `npx convex dev`
2. Check `.env.local` has `NEXT_PUBLIC_CONVEX_URL`

### Problem: Emails not arriving
**Solution:**
1. Check your email service API key is valid
2. Verify your sender email is verified in Resend/SendGrid
3. Check spam folder
4. In development, emails are logged to console even with API keys

---

## Quick Setup Checklist

- [ ] Convex running (`npx convex dev`)
- [ ] Next.js running (`npm run dev`)
- [ ] `.env.local` has all required variables
- [ ] At least one organization with employees exists
- [ ] CRON_SECRET is set
- [ ] (Optional) Email service configured

---

## Advanced: Test Specific Features

### Test Token Validation
```bash
# Get a token from the console logs or database
curl http://localhost:3000/employee/respond?token=YOUR_TOKEN_HERE
```

### Test Token Expiration
Tokens expire after 48 hours. You can manually test this by:
1. Generating a token
2. Manually updating `expiresAt` in Convex dashboard to a past date
3. Try using the token - should show "expired" message

### Test Response Submission
1. Get a valid token
2. Visit the response page
3. Submit a response
4. Check manager dashboard for updated analytics

---

## Production Testing

When deployed to Vercel, the cron job will run automatically at 4pm daily.

To manually trigger in production:
```bash
curl -X POST https://your-domain.com/api/send-daily-emails \
  -H "Authorization: Bearer YOUR_PRODUCTION_CRON_SECRET" \
  -H "Content-Type: application/json"
```

⚠️ **Security:** Never commit your CRON_SECRET to git!
