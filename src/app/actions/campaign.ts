"use server";

import db from "@/db"; // Import your Drizzle database instance
import { campaigns } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { auth } from "../../../auth"; // Ensure this fetches the current session
import { NewCampaign } from "@/db/schema/campaigns";
import { revalidatePath } from "next/cache";

// 🚀 Fetch campaigns for the logged-in user
export async function fetchCampaigns() {
  const session = await auth();
  if (!session?.user) return [];

  const userId = session.user.id as string;

  // Fetch campaigns where the user is the creator, DM, or a player
  return await db
    .select()
    .from(campaigns)
    .where(or(eq(campaigns.creatorId, userId), eq(campaigns.dmId, userId)));
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
