// Magic link / OAuth callback — exchanges code for session and redirects
// Design Ref: §4.1 Auth flow (Supabase Auth OAuth/OTP callback)
// URL: /auth/callback (must not be inside a Route Group so it stays literal)

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/services/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
