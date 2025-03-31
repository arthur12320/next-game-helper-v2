"use server";

import  db  from "@/db";
import { chapters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../../../auth";
import { revalidatePath } from "next/cache";

// ➕ **Create a new Chapter**
export async function createChapter({ campaignId, name }: { campaignId: string; name: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("User not authenticated");

  await db.insert(chapters).values({
    name,
    campaignId,
  });
  revalidatePath("/campaigns/[campaignId]",'page');
}

// ❌ **Delete a Chapter**
export async function deleteChapter({ chapterId }: { chapterId: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("User not authenticated");

  await db.delete(chapters).where(eq(chapters.id, chapterId));
  revalidatePath("/campaigns/[campaignId]",'page');
}

// 📜 **Fetch Chapters for a Campaign**
export async function fetchChapters(campaignId: string) {
  return await db.query.chapters.findMany({
    where: eq(chapters.campaignId, campaignId),
  });
}
