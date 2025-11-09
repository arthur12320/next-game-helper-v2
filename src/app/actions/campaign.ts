"use server";

import db from "@/db"; // Import your Drizzle database instance
import { campaigns } from "@/db/schema";
import { NewCampaign } from "@/db/schema/campaigns";
import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth"; // Ensure this fetches the current session
import { userHasAccessToCampaign } from "./campaignPermissions";

// 🚀 Fetch campaigns for the logged-in user
export async function fetchCampaigns() {
  const session = await auth();
  if (!session?.user) return [];
  console.log("session", session);

  const userId = session.user.id as string;

  // Fetch campaigns where the user is the creator, DM, or a player
  return await db
    .select()
    .from(campaigns)
    .where(or(eq(campaigns.creatorId, userId), eq(campaigns.dmId, userId)));
}

export async function fetchCampaign(campaignId: string) {
  if (!(await userHasAccessToCampaign(campaignId))) return null;

  return await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1)
    .then((res) => res[0] || null);
}

// 🚀 Create a new campaign
export async function createCampaign(name: string, description: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.insert(campaigns).values({
    name,
    description,
    creatorId: session.user.id,
    dmId: session.user.id, // Default to creator as DM
  } as NewCampaign);
  revalidatePath("/campaigns");
}

// 🚀 Edit (update) an existing campaign
export async function editCampaign(
  id: string,
  updates: { name?: string; description?: string }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // ✅ Check access permission
  const canEdit = await userHasAccessToCampaign(id);
  if (!canEdit) throw new Error("Access denied");

  // ✅ Only update provided fields
  const updateData: Partial<typeof campaigns.$inferInsert> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;

  if (Object.keys(updateData).length === 0)
    throw new Error("No valid fields to update");

  await db.update(campaigns).set(updateData).where(eq(campaigns.id, id));

  revalidatePath("/campaigns");
}

// 🚀 Delete a campaign
export async function deleteCampaign(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db
    .delete(campaigns)
    .where(
      and(
        eq(campaigns.id, id),
        eq(campaigns.creatorId, session.user.id as string)
      )
    );
  revalidatePath("/campaigns");
}
