"use server";

import db from "@/db";
import { campaignPlayers, campaigns } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "../../../auth"; // Assuming you have auth setup

// 🚀 Fetch campaigns for the logged-in user
export async function fetchParticipatingCampaigns() {
  const session = await auth();
  if (!session?.user) return [];

  // const userId = session.user.id as string;

  // // Fetch campaigns where the user is a player
  // const playerCampaigns = await db
  //   .select({ campaignId: campaignPlayers.campaignId })
  //   .from(campaignPlayers)
  //   .where(eq(campaignPlayers.playerId, userId));

  // const playerCampaignIds = playerCampaigns.map((p) => p.campaignId);

  // Fetch campaigns where the user is the creator, DM, or a player
  return await db
    .select()
    .from(campaigns)

}

// ❌ **Abandon Campaign**
export async function abandonCampaign(campaignId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("User not authenticated");

  // Update invite status
  await db
    .delete(campaignPlayers)
    .where(
      and(
        eq(campaignPlayers.campaignId, campaignId),
        eq(campaignPlayers.playerId, session.user.id as string)
      )
    );
}
