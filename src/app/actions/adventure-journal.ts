"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import db from "@/db";
import { adventureJournal } from "@/db/schema";

export async function createJournalEntry(data: {
  title: string;
  content: string;
  tags: string[];
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  try {
    const [entry] = await db
      .insert(adventureJournal)
      .values({
        userId: session.user.id,
        title: data.title,
        content: data.content,
        tags: data.tags,
      })
      .returning();

    revalidatePath("/ai-post-generator");
    return entry;
  } catch (error) {
    console.error("Error creating journal entry:", error);
    throw new Error("Failed to create journal entry");
  }
}

export async function fetchJournalEntries() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  try {
    const entries = await db
      .select()
      .from(adventureJournal)
      .where(eq(adventureJournal.userId, session.user.id))
      .orderBy(desc(adventureJournal.createdAt));

    return entries;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw new Error("Failed to fetch journal entries");
  }
}

export async function updateJournalEntry(
  entryId: string,
  data: {
    title?: string;
    content?: string;
    tags?: string[];
  }
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  try {
    const [entry] = await db
      .update(adventureJournal)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(adventureJournal.id, entryId))
      .returning();

    if (!entry) {
      throw new Error("Journal entry not found");
    }

    revalidatePath("/ai-post-generator");
    return entry;
  } catch (error) {
    console.error("Error updating journal entry:", error);
    throw new Error("Failed to update journal entry");
  }
}

export async function deleteJournalEntry(entryId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  try {
    await db.delete(adventureJournal).where(eq(adventureJournal.id, entryId));

    revalidatePath("/ai-post-generator");
    return { success: true };
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw new Error("Failed to delete journal entry");
  }
}
