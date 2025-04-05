"use server";

import db from "@/db";
import { chapters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { userHasAccessToCampaign } from "./campaignPermissions";

// ➕ **Create a new Chapter**
export async function createChapter({ campaignId, name }: { campaignId: string; name: string }) {
  if (!(await userHasAccessToCampaign(campaignId))) {
    throw new Error("Unauthorized");
  }
  await db.insert(chapters).values({
    name,
    campaignId,
  });
  revalidatePath("/campaigns/[campaignId]", 'page');
}

// ❌ **Delete a Chapter**
export async function deleteChapter({ chapterId }: { chapterId: string }) {
  const campaignId = await db
    .select({ campaignId: chapters.campaignId })
    .from(chapters)
    .where(eq(chapters.id, chapterId))
    .limit(1)
    .then((res) => res[0]?.campaignId);

  if (!(await userHasAccessToCampaign(campaignId))) {
    throw new Error("Unauthorized");
  }

  await db.delete(chapters).where(eq(chapters.id, chapterId));
  revalidatePath("/campaigns/[campaignId]", 'page');
}

// 📜 **Fetch Chapters for a Campaign**
export async function fetchChapters(campaignId: string) {
  if (!(await userHasAccessToCampaign(campaignId))) return [];

  return await db.select().from(chapters).where(eq(chapters.campaignId, campaignId));
}

// 📜 **Fetch Chapters for a Campaign**
export async function fetchChapter(chapterId: string) {
  const campaignId = await db.query.chapters.findFirst({ where: eq(chapters.id, chapterId) }).then((res) => res?.campaignId);
  if (!campaignId || !(await userHasAccessToCampaign(campaignId))) return [];

  return await db.query.chapters.findFirst({ where: eq(chapters.id, chapterId) });
}

