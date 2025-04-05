import db from "@/db";
import { campaignPlayers, campaigns } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { auth } from "../../../auth";

// 🔐 **Checks if the user has access to a campaign**
export async function userHasAccessToCampaign(campaignId: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user) return false; // Not authenticated

    const userId = session.user.id as string;

    // Check if the user is the campaign owner or DM
    const campaign = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(
            and(
                eq(campaigns.id, campaignId),
                or(eq(campaigns.creatorId, userId), eq(campaigns.dmId, userId))
            )
        )
        .limit(1);

    if (campaign.length > 0) return true; // User is the owner or GM

    // Check if the user is a player in this campaign
    const isPlayer = await db
        .select({ id: campaignPlayers.playerId })
        .from(campaignPlayers)
        .where(
            and(eq(campaignPlayers.campaignId, campaignId), eq(campaignPlayers.playerId, userId))
        )
        .limit(1);

    return isPlayer.length > 0; // True if user is a player
}

export async function isCampaignOwner(campaignId: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user) return false;

    const userId = session.user.id as string;

    // Check if the user is the owner of the campaign
    const campaign = await db.query.campaigns.findFirst({
        where: (c, { eq }) => eq(c.id, campaignId),
        columns: { creatorId: true },
    });

    return campaign?.creatorId === userId;
}

export async function isCampaignGM(campaignId: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user) return false;

    const userId = session.user.id as string;

    // Check if the user is the GM of the campaign
    const campaign = await db.query.campaigns.findFirst({
        where: (c, { eq }) => eq(c.id, campaignId),
        columns: { dmId: true },
    });

    return campaign?.dmId === userId;
}

export async function isCampaignOwnerOrGM(campaignId: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user) return false;

    const userId = session.user.id as string;

    // Check if the user is either the owner or GM of the campaign
    const campaign = await db.query.campaigns.findFirst({
        where: (c, { eq }) => eq(c.id, campaignId),
        columns: { creatorId: true, dmId: true },
    });

    return campaign?.creatorId === userId || campaign?.dmId === userId;
}