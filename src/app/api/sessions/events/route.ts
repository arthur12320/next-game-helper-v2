import db from "@/db";
import { rpgsessions } from "@/db/schema/rpgSessions";
import type { SessionNotes } from "@/db/schema/rpgSessions";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// The event type as defined in rpgSessions.ts
interface Event {
  timestamp: string;
  description: string;
}

export async function POST(
  request: Request
) {
  const { searchParams } = new URL(request.url);

  const campaignId = searchParams.get("campaignId");
  if (!campaignId) {
    return NextResponse.json(
      { error: "Missing campaignId query parameter" },
      { status: 400 }
    );
  }

  // 1. Authorization
  const authHeader = request.headers.get("Authorization");
  const apiKey = authHeader?.split(" ")[1];
  console.log("Received API key:", apiKey); // Debug log for API key

  if (!process.env.EVENTS_API_KEY) {
    console.error("EVENTS_API_KEY is not set in the environment variables.");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (apiKey !== process.env.EVENTS_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Get request body
    const body = await request.json();
    const { description } = body;

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        {
          error:
            "Invalid event data. A 'description' string is required in the request body.",
        },
        { status: 400 }
      );
    }

    const newEvent: Event = { description, timestamp: new Date().toISOString() };

    // 3. Find the latest open session for the campaign
    const [latestSession] = await db
      .select({ id: rpgsessions.id, notes: rpgsessions.notes })
      .from(rpgsessions)
      .where(
        and(
          eq(rpgsessions.campaignId, campaignId),
          eq(rpgsessions.status, "in_progress")
        )
      )
      .orderBy(desc(rpgsessions.sessionNumber))
      .limit(1);

    if (!latestSession) {
      return NextResponse.json(
        { error: "No open session found for this campaign" },
        { status: 404 }
      );
    }

    // 4. Update the notes
    const currentNotes: SessionNotes = latestSession.notes as SessionNotes;
    currentNotes.events.push(newEvent);

    // 5. Save the updated session
    await db.update(rpgsessions).set({
      notes: currentNotes,
      updatedAt: new Date(),
    }).where(eq(rpgsessions.id, latestSession.id));

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error("Error adding event to session:", error);
    if (error instanceof SyntaxError) {
      // JSON parsing error
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}