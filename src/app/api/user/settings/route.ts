import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        geminiApiKey: true,
        facebookAccessToken: true,
        facebookPageId: true,
        youtubeRefreshToken: true,
        tiktokAccessToken: true,
      },
    });

    return NextResponse.json(user || {});
  } catch (error) {
    console.error('[SETTINGS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { geminiApiKey, facebookAccessToken, facebookPageId, youtubeRefreshToken, tiktokAccessToken } = body;

    const userData = {
      geminiApiKey: geminiApiKey || null,
      facebookAccessToken: facebookAccessToken || null,
      facebookPageId: facebookPageId || null,
      youtubeRefreshToken: youtubeRefreshToken || null,
      tiktokAccessToken: tiktokAccessToken || null,
    };

    await prisma.user.upsert({
      where: { email: session.user.email },
      update: userData,
      create: {
        email: session.user.email,
        ...userData,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SETTINGS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
