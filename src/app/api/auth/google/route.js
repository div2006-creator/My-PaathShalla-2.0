import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const role = searchParams.get('role') || 'STUDENT';

  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  
  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const dynamicBaseUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || origin);
  const baseUrl = dynamicBaseUrl.replace(/\/$/, '').trim();
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // If Google OAuth Client ID is missing, provide instant seamless sign-in
  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
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

  const state = JSON.stringify({ role });

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleAuthUrl.toString());
}
