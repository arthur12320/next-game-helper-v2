import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { auth } from "../../../../auth"
import db from "@/db"
import { assets } from "@/db/schema/assets"

// Configure for large files
export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes timeout for large uploads

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the raw body as array buffer for large files
    const contentLength = request.headers.get("content-length")
    const maxSize = 100 * 1024 * 1024 // 100MB

    if (contentLength && Number.parseInt(contentLength) > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 100MB" }, { status: 413 })
    }

    // Parse form data with size limit
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    console.log("Received files:", files.map(file => file.name))

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Limit number of files
    if (files.length > 10) {
      return NextResponse.json({ error: "Too many files. Maximum is 10 files per upload" }, { status: 400 })
    }

    const uploadedAssets: Array<{ id: string; name: string; url: string }> = []

    for (const file of files) {
      if (!file.name || file.size === 0) {
        continue // Skip invalid files
      }

      // Check individual file size
      if (file.size > maxSize) {
        console.warn(`Skipping file ${file.name}: too large (${file.size} bytes)`)
        continue
      }

      try {
        // Convert File to ArrayBuffer for Vercel Blob
        const arrayBuffer = await file.arrayBuffer()

        // Upload to Vercel Blob
        const blob = await put(file.name, arrayBuffer, {
          access: "public",
          contentType: file.type || undefined,
        })

        // Save to database with optional campaign link
        const [insertedAsset] = await db
          .insert(assets)
          .values({
            url: blob.url,
            name: file.name,
            userId: session.user.id as string,
          })
          .returning()

        // Return the proxy URL
        uploadedAssets.push({
          id: insertedAsset.id,
          name: insertedAsset.name,
          url: `/api/files/${insertedAsset.id}`,
        })
      } catch (fileError) {
        console.error(`Error uploading file ${file.name}:`, fileError)
        continue
      }
    }

    if (uploadedAssets.length === 0) {
      return NextResponse.json({ error: "No files were successfully uploaded" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      assets: uploadedAssets,
      message: `${uploadedAssets.length} file(s) uploaded successfully`,
    })
  } catch (error) {
    console.error("Upload error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("body size")) {
        return NextResponse.json({ error: "File too large" }, { status: 413 })
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json({ error: "Upload timeout" }, { status: 408 })
      }
    }

    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
