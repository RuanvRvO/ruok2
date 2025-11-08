// src/components/providers/convex-provider.tsx
'use client';

import React from 'react';
import { ConvexProvider as ConvexProviderInner, ConvexReactClient } from 'convex/react';

let convexClient: ConvexReactClient | null = null;

function getConvexReactClient(): ConvexReactClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  convexClient ??= new ConvexReactClient(url);
  return convexClient;
}

function MissingConvexConfig({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        padding: '32px',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        color: '#856404'
      }}>
        <h1 style={{ marginTop: 0, fontSize: '24px', fontWeight: 'bold' }}>
          ⚠️ Convex Not Configured
        </h1>
        <p style={{ lineHeight: '1.6' }}>
          The application is missing the <code style={{
            background: '#fff',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '14px'
          }}>NEXT_PUBLIC_CONVEX_URL</code> environment variable.
        </p>
        <h2 style={{ fontSize: '18px', marginTop: '20px' }}>To fix this:</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Run <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>npx convex dev</code> to set up your Convex project</li>
          <li>This will create a <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>.env.local</code> file with your deployment URL</li>
          <li>For Vercel deployments, add the environment variable in your Vercel project settings</li>
        </ol>
        <p style={{ marginTop: '20px', fontSize: '14px' }}>
          <strong>Note:</strong> If you&apos;ve already set up Convex, make sure the environment variable is properly configured in your deployment platform.
        </p>
      </div>
    </div>
  );
}

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  const client = getConvexReactClient();
  if (!client) {
    // Show helpful error message instead of silently failing
    return <MissingConvexConfig>{children}</MissingConvexConfig>;
  }
  return <ConvexProviderInner client={client}>{children}</ConvexProviderInner>;
}
