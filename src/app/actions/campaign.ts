"use server";

import  db  from "@/db"; // Import your Drizzle database instance
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../../../auth"; // Ensure this fetches the current session
import { NewCampaign } from "@/db/schema/campaigns";
import { revalidatePath } from "next/cache";



// 🚀 Fetch campaigns for the logged-in user
export async function fetchCampaigns() {
    const session = await auth();
    if (!session?.user) return [];

    return await db.query.campaigns.findMany();
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
  revalidatePath('/campaigns');
}

// 🚀 Delete a campaign
export async function deleteCampaign(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(campaigns).where(eq(campaigns.id, id));
  revalidatePath('/campaigns');
}
