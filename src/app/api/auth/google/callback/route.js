import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const error = searchParams.get('error');

  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : origin);

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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(
          'Google credentials missing in Vercel environment variables. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel Settings and redeploy.'
        )}`
      );
    }

    // Exchange authorization code for tokens
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
      throw new Error(tokenData.error_description || 'Failed to exchange token with Google');
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

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: googleUser.name || cleanEmail.split('@')[0],
          role: role,
          avatarUrl: googleUser.picture || null,
        },
      });
    } else if (googleUser.picture && !user.avatarUrl) {
      // Update avatar if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: googleUser.picture },
      });
    }

    // Create session cookie
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.set('userId', user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(err.message || 'Google Login failed')}`);
  }
}
