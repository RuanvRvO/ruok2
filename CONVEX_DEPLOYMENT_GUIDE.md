# Convex Deployment Guide

## Current Situation

Your Convex backend functions exist locally but haven't been deployed to the cloud yet. This is why you're seeing the error:
```
Could not find public function for 'managers:registerManager'
```

The old system (`/login`, `/registration` using `api.users.*`) works because those functions were previously deployed. The new manager system needs its functions deployed to work.

## What's Been Configured

✅ Created `convex.json` linking to your existing project:
```json
{
  "project": "zany-puffin-357",
  "prodUrl": "https://zany-puffin-357.convex.cloud"
}
```

✅ Created `.env.local` with Convex URL:
```
NEXT_PUBLIC_CONVEX_URL=https://zany-puffin-357.convex.cloud
```

✅ All new backend functions created locally:
- `convex/managers.ts` - Manager authentication
- `convex/organizations.ts` - Organization management
- `convex/employees.ts` - Employee management
- `convex/groups.ts` - Group management
- `convex/responses.ts` - Wellbeing responses
- `convex/analytics.ts` - Dashboard analytics
- `convex/emailTokens.ts` - Secure email tokens
- `convex/schema.ts` - Complete database schema

## Deployment Options

### Option 1: Interactive Login (Recommended for Development)

Run these commands in your terminal:

```bash
# Step 1: Login to Convex
npx convex login

# Step 2: Deploy all functions
npx convex deploy

# Step 3: Verify deployment
npx convex deploy --dry-run
```

This will:
- Open your browser for authentication
- Deploy all 8 new backend modules to your Convex cloud
- Generate updated API types in `convex/_generated/`
- Update your `.env.local` with the deployment URL

### Option 2: Deploy Key (Recommended for CI/CD)

If you want to automate deployments or are in a non-interactive environment:

1. **Get a Deploy Key from Convex Dashboard:**
   - Go to https://dashboard.convex.dev/
   - Navigate to your project: `zany-puffin-357`
   - Go to Settings → Deploy Keys
   - Create a new deploy key
   - Copy the key

2. **Set the Deploy Key as Environment Variable:**
   ```bash
   export CONVEX_DEPLOY_KEY="your-deploy-key-here"
   ```

3. **Deploy using the key:**
   ```bash
   npx convex deploy
   ```

### Option 3: Use Convex Dev Mode (For Active Development)

If you're actively developing and want hot-reloading:

```bash
# Start Convex in development mode
npx convex dev
```

This command will:
- Login (if needed)
- Deploy your functions
- Watch for changes and auto-redeploy
- Generate TypeScript types automatically
- Keep running in the background

**Keep this running in a separate terminal while developing!**

## After Successful Deployment

Once deployment completes, you should see output like:
```
✔ Deployment complete!
  Functions deployed: 8 modules
  - convex/managers.ts
  - convex/organizations.ts
  - convex/employees.ts
  - convex/groups.ts
  - convex/responses.ts
  - convex/analytics.ts
  - convex/emailTokens.ts
  - convex/schema.ts
```

## Verification Steps

After deployment, test the new system:

1. **Test Manager Registration:**
   ```bash
   npm run dev
   # Navigate to http://localhost:3000/manager/register
   # Try creating a new organization
   ```

2. **Check Convex Dashboard:**
   - Go to https://dashboard.convex.dev/
   - Open your project: `zany-puffin-357`
   - Click on "Functions" tab
   - You should see all new functions listed:
     - `managers:registerManager`
     - `managers:loginManager`
     - `organizations:createOrganization`
     - etc.

3. **Verify Database Schema:**
   - In the Convex dashboard, click "Data"
   - You should see new tables:
     - managers
     - organizations
     - employees
     - groups
     - responses
     - emailTokens

## Troubleshooting

### "Cannot prompt for input in non-interactive terminals"
- You need to run the commands in an interactive terminal
- If using SSH, make sure you're not in a script/automated environment
- Try Option 2 (Deploy Key) for non-interactive environments

### "Error: Project not found"
- Verify you're in the project directory: `/home/user/ruok2`
- Check that `convex.json` exists and has the correct project ID

### "Error: Schema validation failed"
- Review the error message for which table/field has an issue
- Check `convex/schema.ts` for any syntax errors
- Make sure all referenced types are defined

### Functions Still Not Found After Deployment
- Clear your browser cache
- Restart your Next.js dev server
- Check that `.env.local` has the correct URL
- Verify functions are listed in the Convex dashboard

## Next Steps After Deployment

1. **Update Production Environment Variables:**
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel domain
   - Set `CRON_SECRET` to a secure random string
   - Configure email service (RESEND_API_KEY or SENDGRID_API_KEY)

2. **Remove TypeScript Workarounds:**
   - Once deployment is complete and types are generated
   - Remove `apiAny` type assertions in favor of properly typed `api`
   - Re-enable strict TypeScript checks in `eslint.config.ts`
   - Set `typescript.ignoreBuildErrors: false` in `next.config.js`

3. **Deploy to Vercel:**
   - Commit and push your changes
   - Vercel will automatically build and deploy
   - Set environment variables in Vercel dashboard
   - The cron job (vercel.json) will start running automatically

## Need Help?

If you encounter issues:
- Check Convex docs: https://docs.convex.dev/
- Review deployment logs for specific error messages
- Verify all files are in the correct locations
- Ensure no syntax errors in your Convex functions
