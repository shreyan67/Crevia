import { NextRequest, NextResponse } from "next/server";
import { loginWithGoogle } from "@/app/actions/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_cancelled", request.url));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${origin}/api/auth/google/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || "Token exchange failed");
    }

    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userinfoResponse.json();

    if (!profile.email) {
      throw new Error("No email in Google profile");
    }

    const result = await loginWithGoogle({
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      avatar: profile.picture,
    });

    if (result.success) {
      return NextResponse.redirect(new URL("/my-orders", request.url));
    } else {
      return NextResponse.redirect(new URL("/login?error=account_creation_failed", request.url));
    }
  } catch (error) {
    console.error("[Google OAuth Callback Error]:", error);
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }
}
