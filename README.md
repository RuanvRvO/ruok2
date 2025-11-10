# R U OK? - Employee Wellbeing Tracking Platform

A comprehensive Next.js application for tracking employee emotional wellbeing through daily check-ins. Built with Next.js 15, Convex, and designed for seamless Vercel deployment.

## Features

### For Managers
- **Organization Management**: Create and manage your organization
- **Employee Management**: Add, edit, and organize employees into groups
- **Real-time Dashboard**: View organization-wide and group-based analytics
- **Wellbeing Trends**: Track employee wellbeing patterns over time
- **Response Tracking**: Monitor daily response rates and status distribution

### For Employees
- **Simple Check-ins**: Quick Green/Amber/Red status selection
- **Optional Comments**: Add detailed feedback about their day
- **Privacy Options**: Keep written responses anonymous while maintaining tracking
- **Email Notifications**: Automatic daily reminders at 4pm
- **Mobile-Friendly**: Responsive design works on all devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Convex (serverless backend)
- **Deployment**: Vercel
- **Email**: Resend or SendGrid
- **Type Safety**: TypeScript

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Convex account (free tier available)
- A Vercel account (free tier available)
- An email service account (Resend or SendGrid)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Guide you through Convex setup
   - Deploy your schema and functions
   - Generate a `.env.local` file with your Convex URL

3. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   - `NEXT_PUBLIC_CONVEX_URL` - From Convex setup
   - `CONVEX_DEPLOYMENT` - From Convex setup
   - `NEXT_PUBLIC_APP_URL` - Your local URL (http://localhost:3000)
   - `RESEND_API_KEY` or `SENDGRID_API_KEY` - Your email service API key
   - `EMAIL_FROM` - Your verified sender email
   - `CRON_SECRET` - A random secret string for cron security

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Steps

1. Push your code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Usage

### Creating an Organization

1. Visit `/manager/register`
2. Fill in your details and organization name
3. Add employee emails (comma or newline separated)
4. Submit to create your organization

### Managing Employees & Groups

1. Login as manager at `/manager/login`
2. Use the dashboard tabs to:
   - View analytics (Overview)
   - Manage employees (Employees tab)
   - Create and manage groups (Groups tab)

### Daily Check-ins

Employees receive an email at 4pm daily with a link to submit their wellbeing status:
1. Click the link in the email
2. Select Green, Amber, or Red
3. Optionally add a comment
4. Choose anonymous option if desired
5. Submit

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types
- `npx convex dev` - Start Convex development mode
- `npx convex deploy` - Deploy Convex functions

## Project Structure

```
ruok2/
├── convex/                  # Convex backend functions
├── src/
│   ├── app/
│   │   ├── manager/        # Manager pages
│   │   ├── employee/       # Employee pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   └── hooks/              # Custom hooks
├── vercel.json             # Vercel config (cron)
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

## Security Notes

⚠️ **Important**: The current implementation uses plain text passwords for simplicity. For production use:
- Implement proper password hashing (bcrypt/argon2)
- Add rate limiting
- Use CSRF protection
- Implement proper session management

## Troubleshooting

### Convex Errors
- Run `npx convex deploy`
- Check Convex dashboard for errors
- Verify `NEXT_PUBLIC_CONVEX_URL`

### Email Issues
- Verify API key is correct
- Ensure sender email is verified
- Check Vercel function logs

## License

Provided as-is for employee wellbeing tracking.
