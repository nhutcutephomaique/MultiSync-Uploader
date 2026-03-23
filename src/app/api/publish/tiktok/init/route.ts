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

    const { videoSize, chunkSize = 10485760 } = await req.json(); // default 10MB chunk

    if (!videoSize) {
      return NextResponse.json({ error: "Missing video_size" }, { status: 400 });
    }

    const totalChunkCount = Math.ceil(videoSize / chunkSize);

    const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${user.tiktokAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: chunkSize,
          total_chunk_count: totalChunkCount
        }
      })
    });

    const initData = await initRes.json();

    if (!initRes.ok) {
      console.error("TikTok Init Error:", initData);
      return NextResponse.json({ error: "TikTok returned an error", details: initData }, { status: initRes.status });
    }

    // TikTok returns publish_id and upload_url.
    // If chunked, it might return an array or single url. 
    return NextResponse.json({ result: initData.data });

  } catch (error) {
    console.error("TikTok Init API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
