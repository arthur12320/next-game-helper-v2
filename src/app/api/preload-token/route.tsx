import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Convert URL to base64
    const base64Url = Buffer.from(imageUrl).toString("base64");

    // Call OTFBM token preload API from server-side (no CORS issues)
    const response = await fetch(`https://token.otfbm.io/meta/${base64Url}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to preload token image" },
        { status: response.status }
      );
    }

    const htmlResponse = await response.text();

    const bodyMatch = htmlResponse.match(/<body>(.*?)<\/body>/);
    const shortcode = bodyMatch ? bodyMatch[1].trim() : htmlResponse.trim();

    return NextResponse.json({ shortcode });
  } catch (error) {
    console.error("[v0] Error in preload-token API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
