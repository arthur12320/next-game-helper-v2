"use server"

import db from "@/db"
import { rpgsessions, SessionNotes } from "@/db/schema/rpgSessions"
import { eq, and, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "../../../auth"

export async function createSession(campaignId: string, title: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Authentication required")

  // Get the next session number for this campaign
  const existingSessions = await db
    .select()
    .from(rpgsessions)
    .where(eq(rpgsessions.campaignId, campaignId))
    .orderBy(desc(rpgsessions.sessionNumber))

  const nextSessionNumber = existingSessions.length > 0 ? existingSessions[0].sessionNumber + 1 : 1

  const [newSession] = await db
    .insert(rpgsessions)
    .values({
      campaignId,
      userId: session.user.id,
      sessionNumber: nextSessionNumber,
      title,
      startDate: new Date(),
      status: "in_progress",
    })
    .returning()

  revalidatePath(`/campaigns/${campaignId}`)
  return newSession
}

export async function updateSessionNotes(sessionId: string, notes: SessionNotes) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Authentication required")

  const [updatedSession] = await db
    .update(rpgsessions)
    .set({
      notes,
      updatedAt: new Date(),
    })
    .where(and(eq(rpgsessions.id, sessionId), eq(rpgsessions.userId, session.user.id)))
    .returning()

  return updatedSession
}

export async function completeSession(sessionId: string, summary?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Authentication required")

  const [completedSession] = await db
    .update(rpgsessions)
    .set({
      status: "completed",
      endDate: new Date(),
      summary,
      updatedAt: new Date(),
    })
    .where(and(eq(rpgsessions.id, sessionId), eq(rpgsessions.userId, session.user.id)))
    .returning()

  revalidatePath(`/campaigns/${completedSession.campaignId}`)
  return completedSession
}

export async function fetchSessionsByCampaign(campaignId: string) {
  const allSessions = await db
    .select()
    .from(rpgsessions)
    .where(eq(rpgsessions.campaignId, campaignId))
    .orderBy(desc(rpgsessions.sessionNumber))

  return allSessions
}

export async function fetchSession(sessionId: string) {
  const [session] = await db.select().from(rpgsessions).where(eq(rpgsessions.id, sessionId))
  return session
}

export async function deleteSession(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Authentication required")

  await db.delete(rpgsessions).where(and(eq(rpgsessions.id, sessionId), eq(rpgsessions.userId, session.user.id)))

  revalidatePath("/campaigns")
}
