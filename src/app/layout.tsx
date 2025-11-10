import '@/styles/globals.css';
import type { Metadata } from 'next';
import { ConvexProvider } from '@/components/providers/convex-provider';

export const metadata: Metadata = {
  title: 'R U OK? - Employee Wellbeing Tracking',
  description: 'Track and improve your team\'s emotional wellbeing through daily check-ins',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

// Force dynamic rendering for the entire app (needed for Convex queries)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ConvexProvider>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}
