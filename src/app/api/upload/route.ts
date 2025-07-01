import { type NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "../../../../auth";
import db from "@/db";
import { assets } from "@/db/schema/assets";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.name || file.size === 0) {
        continue; // Skip invalid files
      }

      // Upload to Vercel Blob
      const blob = await put(file.name, file, { access: "public" });

      // Save to database
      await db.insert(assets).values({
        url: blob.url,
        name: file.name,
        userId: session.user.id as string,
      });

      uploadedUrls.push(blob.url);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length} file(s) uploaded successfully`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
