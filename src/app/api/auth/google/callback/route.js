import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const host = request.headers.get('host');
  let baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://my-paath-shalla-2-0.vercel.app').replace(/\/$/, '').trim();
  if (host?.includes('localhost')) {
    baseUrl = 'http://localhost:3000';
  }

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error || 'Google login was cancelled')}`);
  }

  try {
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
      const response = NextResponse.redirect(`${baseUrl}/dashboard`);
      response.cookies.set('userId', 'demo-student-id', {
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
      const response = NextResponse.redirect(`${baseUrl}/dashboard`);
      response.cookies.set('userId', 'demo-student-id', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
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
    
    // Strict Teacher Email Authorization Policy
    const assignedRole = cleanEmail === 'sharmadiv7880@gmail.com' ? 'TEACHER' : 'STUDENT';
    let userId = assignedRole === 'TEACHER' ? 'demo-teacher-id' : 'demo-student-id';

    // Try finding, updating, or creating user in database
    try {
      let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: googleUser.name || cleanEmail.split('@')[0],
            role: assignedRole,
            avatarUrl: googleUser.picture || null,
          },
        });
      } else {
        // Enforce assignedRole on existing DB user record
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            role: assignedRole,
            avatarUrl: googleUser.picture || user.avatarUrl
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
    response.cookies.set('userId', 'demo-student-id', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
    return response;
  }
}
