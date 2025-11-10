# RUOK2 - Full Stack Next.js Application

A modern, full-stack web application built with Next.js, Convex, and deployed on Vercel.

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org) with App Router
- **Backend/Database**: [Convex](https://convex.dev) - Real-time serverless backend
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **UI Components**: [Radix UI](https://www.radix-ui.com)
- **Authentication**: Custom auth with bcrypt password hashing
- **Deployment**: [Vercel](https://vercel.com)
- **Language**: TypeScript

## Features

- User authentication (registration and login)
- Secure password hashing with bcrypt
- Real-time data synchronization with Convex
- Blog-style posts with comments
- User profiles with avatars and bios
- Protected routes with middleware
- Responsive design
- Type-safe API with full TypeScript support

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- A Convex account (free at [dashboard.convex.dev](https://dashboard.convex.dev))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ruok2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Sign up for Convex and get your deployment URL:
```bash
npx convex dev
```
This will:
- Create a new Convex project
- Generate your `NEXT_PUBLIC_CONVEX_URL`
- Start the Convex development server

5. Update your `.env` file with the Convex URL from the previous step.

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# App Configuration
NEXT_PUBLIC_APP_NAME="RUOK2"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Project Structure

```
ruok2/
├── convex/              # Convex backend functions
│   ├── schema.ts        # Database schema
│   ├── users.ts         # User authentication functions
│   ├── posts.ts         # Blog post functions
│   └── comments.ts      # Comment functions
├── src/
│   ├── app/            # Next.js app router pages
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Home page
│   │   ├── login/      # Login page
│   │   ├── registration/ # Registration page
│   │   ├── home/       # User dashboard
│   │   ├── settings/   # User settings
│   │   └── api/        # API routes
│   ├── components/     # React components
│   │   ├── ui/         # Reusable UI components
│   │   └── providers/  # Context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── styles/         # Global styles
├── public/             # Static files
└── convex.json         # Convex configuration
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Import your project to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. Set up environment variables in Vercel:
   - Go to Project Settings > Environment Variables
   - Add `NEXT_PUBLIC_CONVEX_URL` with your Convex production URL

4. Deploy your Convex functions:
```bash
npx convex deploy
```

5. Deploy to Vercel:
```bash
npm run build
vercel --prod
```

### Deploy Convex

For production deployment:

```bash
# Deploy Convex functions
npx convex deploy --prod

# Get your production URL
npx convex dashboard
```

Update the `NEXT_PUBLIC_CONVEX_URL` in Vercel with your production Convex URL.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format:check` - Check code formatting
- `npm run format:write` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking
- `npx convex dev` - Start Convex development server
- `npx convex deploy` - Deploy Convex functions to production

## Database Schema

### Users
- Name, email, password (hashed)
- Avatar and bio (optional)
- Created/updated timestamps

### Posts
- Title, content, published status
- Author (user reference)
- Created/updated timestamps

### Comments
- Content
- Post and user references
- Created timestamp

### Sessions
- User authentication sessions
- Token and expiration

## Security

- Passwords are hashed using bcrypt with salt
- Protected routes use middleware
- API routes validate input
- Environment variables for sensitive data
- Type-safe database operations with Convex

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Convex documentation](https://docs.convex.dev)
- Open an issue in this repository

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Backend powered by [Convex](https://convex.dev)
- UI components from [Radix UI](https://www.radix-ui.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)
