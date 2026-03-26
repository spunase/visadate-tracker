import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Auth callback handler for Supabase OAuth (Google) and magic link redirects.
 *
 * When a user signs in via Google OAuth or clicks a magic link email,
 * Supabase redirects them to this route with a `code` query parameter.
 * We exchange that code for a session, then redirect to the intended page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/track";

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If code exchange fails or no code, redirect to track with error indicator
  return NextResponse.redirect(`${origin}/track?auth_error=true`);
}
