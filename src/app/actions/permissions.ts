import db from "@/db";
import { auth } from "../../../auth";

// 🚀 Check if the user has access to a campaign
export async function hasCampaignAccess(campaignId: string) {
    const session = await auth();
    if (!session?.user) return false; // User is not authenticated

    const userId = session.user.id as string;

    // Check if the user is the creator, DM, or a player
    const campaign = await db.query.campaigns.findFirst({
        where: (c, { eq }) => eq(c.id, campaignId),
    });

    if (campaign !== undefined) return true; // User is either the creator or DM

    // If not, check if the user is a player in the campaign
    const isPlayer = await db.query.campaignPlayers.findFirst({
        where: (c, { eq }) => eq(c.campaignId, campaignId) && eq(c.playerId, userId),
    });

    return isPlayer !== undefined; // Returns true if the user is a player
}
