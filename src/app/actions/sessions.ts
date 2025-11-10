"use server";

import db from "@/db";
import {
  rpgsessions,
  type SessionNotes,
  sessionPresence,
} from "@/db/schema/rpgSessions";

import { eq, and, desc, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";

export async function createSession(campaignId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Authentication required");

  // Get the next session number for this campaign
  const existingSessions = await db
    .select()
    .from(rpgsessions)
    .where(eq(rpgsessions.campaignId, campaignId))
    .orderBy(desc(rpgsessions.sessionNumber));

  const nextSessionNumber =
    existingSessions.length > 0 ? existingSessions[0].sessionNumber + 1 : 1;

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
    .returning();

  revalidatePath(`/campaigns/${campaignId}`);
  return newSession;
}

export async function updateSessionNotes(
  sessionId: string,
  notes: SessionNotes
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Authentication required");

  const [updatedSession] = await db
    .update(rpgsessions)
    .set({
      notes,
      updatedAt: new Date(),
    })
    .where(and(eq(rpgsessions.id, sessionId)))
    .returning();

  return updatedSession;
}

export async function completeSession(sessionId: string, summary?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Authentication required");

  const [completedSession] = await db
    .update(rpgsessions)
    .set({
      status: "completed",
      endDate: new Date(),
      summary,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(rpgsessions.id, sessionId),
        eq(rpgsessions.userId, session.user.id)
      )
    )
    .returning();

  revalidatePath(`/campaigns/${completedSession.campaignId}`);
  return completedSession;
}

export async function fetchSessionsByCampaign(campaignId: string) {
  const allSessions = await db
    .select()
    .from(rpgsessions)
    .where(eq(rpgsessions.campaignId, campaignId))
    .orderBy(desc(rpgsessions.sessionNumber));

  return allSessions;
}

export async function fetchSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(rpgsessions)
    .where(eq(rpgsessions.id, sessionId));
  return session;
}

export async function deleteSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Authentication required");

  await db.delete(rpgsessions).where(and(eq(rpgsessions.id, sessionId)));

  revalidatePath("/campaigns");
}

export async function fetchSessionData(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Authentication required");

  const [sessionData] = await db
    .select()
    .from(rpgsessions)
    .where(eq(rpgsessions.id, sessionId));

  if (!sessionData) throw new Error("Session not found");

  const activeUsers = await db
    .select()
    .from(sessionPresence)
    .where(
      and(
        eq(sessionPresence.sessionId, sessionId),
        gt(sessionPresence.lastSeen, new Date(Date.now() - 30000))
      )
    ); // Active in last 30 seconds

  return {
    session: sessionData,
    activeUsers: activeUsers.map((u) => ({
      userId: u.userId,
      userName: u.userName,
      lastSeen: u.lastSeen,
    })),
  };
}

export async function updatePresence(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Authentication required");

  const userEmail = session.user.email || session.user.id;

  await db
    .insert(sessionPresence)
    .values({
      sessionId,
      userId: session.user.id,
      userName: userEmail,
      lastSeen: new Date(),
    })
    .onConflictDoUpdate({
      target: [sessionPresence.sessionId, sessionPresence.userId],
      set: {
        lastSeen: new Date(),
        userName: userEmail, // Also update userName on conflict
      },
    });
}

export async function getSessionData(sessionId: string) {
  return await fetchSessionData(sessionId);
}
