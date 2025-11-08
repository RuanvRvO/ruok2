import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Call Convex to validate login
    const user = await convex.query(api.users.loginUser, {
      email,
      password,
    });

    return NextResponse.json(
      { 
        message: 'Login successful', 
        user: user 
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Invalid credentials' },
      { status: 401 }
    );
  }
}