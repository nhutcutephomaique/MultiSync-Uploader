import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { facebookAccessToken: true }
    });

    if (!user?.facebookAccessToken) {
      return NextResponse.json({ error: "Chưa cài đặt Facebook Access Token trong Cài Đặt." }, { status: 400 });
    }

    // Parse the incoming multipart form with the video file
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string || "";
    const description = formData.get("description") as string || "";

    if (!file) {
      return NextResponse.json({ error: "Không có file video trong yêu cầu." }, { status: 400 });
    }

    // Forward to Facebook Graph API using the user's stored token
    const fbFormData = new FormData();
    fbFormData.append("source", file);
    fbFormData.append("title", title);
    fbFormData.append("description", description);
    fbFormData.append("access_token", user.facebookAccessToken);

    const fbRes = await fetch("https://graph.facebook.com/v19.0/me/videos", {
      method: "POST",
      body: fbFormData,
    });

    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      console.error("Facebook API Error:", fbData);
      const msg = fbData?.error?.message || "Lỗi không xác định từ Facebook";
      // Help user understand permission errors
      if (fbData?.error?.code === 100) {
        return NextResponse.json({
          error: `Lỗi quyền Facebook (#100): Token của bạn chưa có scope 'video_manage'. Hãy tạo lại token với đủ quyền: pages_manage_posts, video_manage, pages_read_engagement. Hoặc thay 'me/videos' bằng '{page-id}/videos'.`
        }, { status: 403 });
      }
      return NextResponse.json({ error: msg }, { status: fbRes.status });
    }

    return NextResponse.json({ success: true, videoId: fbData.id });
  } catch (error) {
    console.error("Facebook Upload API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};
