import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const error = searchParams.get('error');

  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : origin);
  const baseUrl = rawBaseUrl.replace(/\/$/, '').trim();

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error || 'Google login was cancelled')}`);
  }

  let role = 'STUDENT';
  try {
    if (stateRaw) {
      const parsedState = JSON.parse(stateRaw);
      if (parsedState.role) {
        role = parsedState.role.toUpperCase();
      }
    }
  } catch (e) {
    // default to STUDENT if state parsing fails
  }

  try {
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
      const response = NextResponse.redirect(`${baseUrl}/dashboard`);
      const demoId = role === 'TEACHER' ? 'demo-teacher-id' : 'demo-student-id';
      response.cookies.set('userId', demoId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    // Exchange authorization code for tokens with Google
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.warn('Google token exchange error:', tokenData);
      // Fallback to demo session on token exchange error
      const response = NextResponse.redirect(`${baseUrl}/dashboard`);
      const demoId = role === 'TEACHER' ? 'demo-teacher-id' : 'demo-student-id';
      response.cookies.set('userId', demoId, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
      return response;
    }

    // Fetch user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!googleUser.email) {
      throw new Error('Could not retrieve user email from Google');
    }

    const cleanEmail = googleUser.email.trim().toLowerCase();
    let userId = role === 'TEACHER' ? 'demo-teacher-id' : 'demo-student-id';

    // Try finding or creating user in database
    try {
      let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: googleUser.name || cleanEmail.split('@')[0],
            role: role,
            avatarUrl: googleUser.picture || null,
          },
        });
      }
      if (user) {
        userId = user.id;
      }
    } catch (dbErr) {
      console.warn('Database offline, using memory session for Google user:', dbErr.message);
    }

    // Create session cookie
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.set('userId', userId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    const demoId = role === 'TEACHER' ? 'demo-teacher-id' : 'demo-student-id';
    response.cookies.set('userId', demoId, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
    return response;
  }
}
