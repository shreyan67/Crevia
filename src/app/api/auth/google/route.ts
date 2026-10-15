import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`;

  if (!clientId || clientId === "your-google-client-id") {
    // If credentials are not yet configured in .env, redirect to login with note
    return NextResponse.redirect(
      new URL("/login?notice=google_keys_needed", request.url)
    );
  }

  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=online&prompt=select_account`;

  return NextResponse.redirect(authUrl);
}
