import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      return Response.json({ error: "No authorization code" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${request.nextUrl.origin}/api/integrations/google/callback`;

    if (!clientId || !clientSecret) {
      return Response.json(
        { error: "Google OAuth not configured" },
        { status: 500 }
      );
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      return Response.json(
        { error: err.error_description || "Token exchange failed" },
        { status: 502 }
      );
    }

    const tokens = await tokenRes.json();

    // Redirect back to settings with tokens in hash (client-side only)
    const params = new URLSearchParams({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token || "",
      google_expires_in: String(tokens.expires_in || 3600),
    });

    return Response.redirect(
      `${request.nextUrl.origin}/app/settings?tab=integrations&${params.toString()}`
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "OAuth callback failed" },
      { status: 500 }
    );
  }
}
