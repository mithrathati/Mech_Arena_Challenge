import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check if BLOB_READ_WRITE_TOKEN exists (Vercel Blob)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // If the store is private, we MUST use 'private' access. 
      // If the store is public, 'public' is preferred.
      // Since changing to public is difficult in the UI, we'll try private first as per the error message.
      const blob = await put(file.name, file, {
        access: 'private', 
      });
      return NextResponse.json({ url: blob.url });
    }

    // Fallback for local development or if Vercel Blob is not configured
    // Note: This will still fail on Vercel production without the token
    return NextResponse.json({ 
      error: "Cloud storage not configured. Please contact administrator." 
    }, { status: 501 });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
