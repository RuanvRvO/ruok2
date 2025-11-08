# Convex Setup Guide

This document explains how to fix the authentication and configuration errors in your application.

## The Problem

You're seeing two errors:
1. **Client-side exception** on the register page
2. **"Server misconfigured: missing Convex URL"** on login

Both are caused by the missing `NEXT_PUBLIC_CONVEX_URL` environment variable.

## Solution

### For Local Development

1. **Install Convex CLI** (if not already installed):
   ```bash
   npm install -g convex
   ```

2. **Initialize Convex Project**:
   ```bash
   npx convex dev
   ```

   This command will:
   - Prompt you to log in to Convex (or create an account)
   - Create a new Convex deployment
   - Generate a `.env.local` file with your `NEXT_PUBLIC_CONVEX_URL`
   - Start the Convex development server

3. **Verify the Setup**:
   Check that `.env.local` was created and contains:
   ```bash
   cat .env.local
   ```

   You should see:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

4. **Start Your Dev Server**:
   ```bash
   npm run dev
   ```

### For Vercel Deployment

1. **Get Your Convex URL**:
   - Run `npx convex dev` locally first (if you haven't)
   - Your deployment URL is in `.env.local`
   - Or get it from the [Convex Dashboard](https://dashboard.convex.dev/)

2. **Add to Vercel**:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add a new variable:
     - **Name**: `NEXT_PUBLIC_CONVEX_URL`
     - **Value**: `https://your-deployment.convex.cloud`
   - Apply to: Production, Preview, and Development

3. **Redeploy**:
   - Trigger a new deployment or redeploy the existing one
   - The environment variable will now be available

## Convex Project Structure

Your Convex backend is located in the `/convex` directory:

- **`convex/schema.ts`** - Database schema (users table)
- **`convex/users.ts`** - User authentication functions:
  - `registerUser` - Create new user account
  - `loginUser` - Authenticate user
  - `getUserByEmail` - Fetch user data
  - `getAllUsers` - Get all users (admin)

## Troubleshooting

### Error: "Cannot prompt for input in non-interactive terminals"
This happens when running `npx convex dev` in non-interactive environments. Run the command from your local terminal where you can interact with prompts.

### Error: "No CONVEX_DEPLOYMENT set"
This means Convex hasn't been initialized yet. Run `npx convex dev` to set it up.

### App still shows error after setup
1. Restart your development server
2. Check that `.env.local` exists and has the correct URL
3. For Vercel, make sure you've redeployed after adding the environment variable

### How to check if Convex is working
Visit the Convex dashboard at: https://dashboard.convex.dev/
You should see your deployment and can monitor function calls in real-time.

## Important Notes

- The `.env.local` file is gitignored (as it should be)
- Each developer needs to run `npx convex dev` on their local machine
- Production and preview deployments need the environment variable set in Vercel
- The same Convex deployment can be used for all environments, or you can create separate deployments for dev/staging/prod

## Need Help?

- [Convex Documentation](https://docs.convex.dev/)
- [Convex Discord Community](https://convex.dev/community)
