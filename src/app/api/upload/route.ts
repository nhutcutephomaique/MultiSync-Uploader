import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Safe filename encoding
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${crypto.randomUUID()}-${originalName}`;
    
    // Use /tmp which is writable on both Vercel and local environments.
    // public/uploads is read-only on Vercel serverless.
    const uploadDir = "/tmp/uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Return a server-internal path for the AI generate API to read from
    const fileUrl = `/tmp/uploads/${filename}`;

    return NextResponse.json({ 
      message: "Success", 
      fileUrl,
      fileName: filename
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
