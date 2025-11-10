# Deployment Guide

This guide walks you through deploying your RUOK2 application to production.

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (free tier available)
- Convex account (free tier available)

## Step-by-Step Deployment

### 1. Set Up Convex Production Environment

First, deploy your Convex backend:

```bash
# Login to Convex
npx convex login

# Deploy to production
npx convex deploy --prod
```

This will:
- Create a production Convex deployment
- Give you a production `NEXT_PUBLIC_CONVEX_URL`
- Deploy all your schema and functions

**Save the production URL** - you'll need it for Vercel!

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
   NEXT_PUBLIC_APP_NAME=RUOK2
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

6. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Follow the prompts and add environment variables when asked.

### 3. Update Convex URL in Production

After Vercel deployment:

1. Get your Vercel deployment URL (e.g., `https://ruok2.vercel.app`)
2. Update the `NEXT_PUBLIC_APP_URL` environment variable in Vercel
3. Redeploy if necessary

### 4. Verify Deployment

Test your production deployment:

1. Visit your Vercel URL
2. Try registering a new user
3. Try logging in
4. Check the Convex dashboard to verify data is being stored

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | `https://happy-animal-123.convex.cloud` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `RUOK2` |
| `NEXT_PUBLIC_APP_URL` | Production URL | `https://ruok2.vercel.app` |

### Optional Variables for CI/CD

| Variable | Description | Where to Get It |
|----------|-------------|----------------|
| `CONVEX_DEPLOY_KEY` | For automated deployments | Convex Dashboard → Settings → Deploy Keys |

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

### Custom Domains

To add a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `ruok2.com`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Monitoring and Logs

### Vercel Logs

View deployment and runtime logs:
```bash
vercel logs [deployment-url]
```

Or visit: Vercel Dashboard → Your Project → Deployments → [Select Deployment] → Runtime Logs

### Convex Logs

View backend logs:
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Click "Logs" tab

## Troubleshooting

### Build Fails on Vercel

**Issue**: Build fails with "Cannot find module"
**Solution**:
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Convex Connection Issues

**Issue**: Frontend can't connect to Convex
**Solution**:
1. Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly in Vercel
2. Check that Convex deployment is active
3. Ensure URL starts with `https://`

### Type Errors During Build

**Issue**: TypeScript errors during Vercel build
**Solution**:
```bash
# Test build locally first
npm run build

# Fix any errors
npm run typecheck
```

### Environment Variables Not Working

**Issue**: Environment variables don't seem to be working
**Solution**:
1. Vercel: Variables starting with `NEXT_PUBLIC_` are available client-side
2. Redeploy after adding new environment variables
3. For server-side variables, don't use `NEXT_PUBLIC_` prefix

## Rollback

If you need to rollback:

### Vercel
1. Go to Vercel Dashboard → Your Project → Deployments
2. Find a previous successful deployment
3. Click the three dots → "Promote to Production"

### Convex
Convex doesn't support automatic rollback, but you can:
1. Check out the previous version in git
2. Run `npx convex deploy --prod` again

## Performance Optimization

### Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to your layout:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Database Indexes

Ensure your Convex schema has proper indexes for frequently queried fields. Already configured in `convex/schema.ts`:
- Users: indexed by email and creation date
- Posts: indexed by user and published status
- Comments: indexed by post and user

## Security Checklist

Before going to production:

- [ ] All passwords are hashed (using bcrypt)
- [ ] Environment variables are set correctly
- [ ] No secrets in git repository
- [ ] CORS is properly configured
- [ ] Rate limiting is considered (for API routes)
- [ ] Input validation on all forms
- [ ] SQL injection protection (handled by Convex)
- [ ] XSS protection (handled by React)

## Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Convex**: [docs.convex.dev](https://docs.convex.dev) or Discord
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

## Cost Estimation

### Free Tier Limits

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Preview deployments

**Convex Free Tier**:
- 1M function calls/month
- 1 GB storage
- Unlimited projects

Both platforms offer generous free tiers suitable for small to medium applications.
