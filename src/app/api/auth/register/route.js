import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ 
    error: 'Account registration requires Google Email Verification. Please click "Continue with Google" to register your account.' 
  }, { status: 400 });
}
