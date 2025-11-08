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

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  const client = getConvexReactClient();
  if (!client) return <>{children}</>; // render anyway; avoids build crash if env missing
  return <ConvexProviderInner client={client}>{children}</ConvexProviderInner>;
}
