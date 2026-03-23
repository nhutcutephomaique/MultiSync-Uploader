import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    // Temporary bypass for local development while DB is not configured
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { videoUrl, title, description, platform } = await request.json();

    if (!platform || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // In a production system:
    // 1. Fetch user's OAuth tokens from DB (Facebook/Google/TikTok).
    // 2. Dispatch a background job in a Queue (BullMQ, SQS, etc) with tokens and videoUrl.
    // 3. Update the PublishJob status in the DB.

    console.log(`[Publishing Engine] Received job for ${platform}: ${title}`);

    // Simulating response
    return NextResponse.json({ 
      message: "Video has been queued for publishing",
      status: "processing",
      jobId: `job_${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error("Publish API Error:", error);
    return NextResponse.json({ error: "Failed to schedule publishing" }, { status: 500 });
  }
}
