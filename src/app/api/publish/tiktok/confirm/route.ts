import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tiktokAccessToken: true }
    });

    if (!user?.tiktokAccessToken) {
      return NextResponse.json({ error: "No TikTok Access Token configured." }, { status: 400 });
    }

    const { publishId, title, description } = await req.json();

    if (!publishId) {
      return NextResponse.json({ error: "Missing publishId" }, { status: 400 });
    }

    // Call TikTok to publish
    const publishRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${user.tiktokAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        publish_id: publishId,
        video_metadata: {
            title: title || "",
            description: description || ""
        }
      })
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok) {
      console.error("TikTok Publish Error:", publishData);
      return NextResponse.json({ error: "TikTok returned an error", details: publishData }, { status: publishRes.status });
    }

    return NextResponse.json({ success: true, result: publishData.data });

  } catch (error) {
    console.error("TikTok Confirm API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
