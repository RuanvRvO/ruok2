// src/app/api/login/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

// Lazy init so we don't throw during module load if env is missing
let convexClient: ConvexHttpClient | null = null;
function getConvex(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  if (!convexClient) convexClient = new ConvexHttpClient(url);
  return convexClient;
}

type LoginBody = { email: string; password: string };

// This matches the shape you return in users.ts -> loginUser
type LoginUserResult = {
  _id: string;      // Convex Id serializes to string over HTTP
  name: string;
  email: string;
  createdAt: number;
};

function isLoginBody(v: unknown): v is LoginBody {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Record<string, unknown>).email === 'string' &&
    typeof (v as Record<string, unknown>).password === 'string'
  );
}

export async function POST(request: NextRequest) {
  try {
    const raw: unknown = await request.json();
    if (!isLoginBody(raw)) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { email, password } = raw;

    const client = getConvex();
    if (!client) {
      // Clear message instead of crashing the process
      console.error('Missing NEXT_PUBLIC_CONVEX_URL');
      return NextResponse.json(
        { message: 'Server misconfigured: missing Convex URL' },
        { status: 500 }
      );
    }

    // Your loginUser is a QUERY (not mutation) in convex/users.ts
    let user: LoginUserResult | null = null;
    try {
      const res: unknown = await client.query(api.users.loginUser, { email, password });
      user = res as LoginUserResult;
    } catch (convexErr: unknown) {
      // Your Convex code throws "Invalid email or password" on bad creds
      const msg =
        convexErr instanceof Error ? convexErr.message : 'Invalid email or password';
      return NextResponse.json({ message: msg }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login successful', user }, { status: 200 });
  } catch (err: unknown) {
    console.error('Login route error:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// Helpful health check to separate route import errors from handler logic
export async function GET() {
  return NextResponse.json({ ok: true });
}
