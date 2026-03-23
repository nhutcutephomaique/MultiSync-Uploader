import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { youtubeRefreshToken: true }
    });

    if (!user?.youtubeRefreshToken) {
      return NextResponse.json({ error: "No YouTube Refresh Token configured." }, { status: 400 });
    }

    // Exchange refresh token for access token using standard Google OAuth endpoint
    const clientId = process.env.AUTH_GOOGLE_ID;
    const clientSecret = process.env.AUTH_GOOGLE_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Server missing Google Client Credentials." }, { status: 500 });
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: user.youtubeRefreshToken,
        grant_type: "refresh_token"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube Token Exchange Error:", data);
      return NextResponse.json({ error: "Failed to exchange refresh token.", details: data }, { status: response.status });
    }

    return NextResponse.json({ accessToken: data.access_token });

  } catch (error) {
    console.error("YouTube Auth API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
