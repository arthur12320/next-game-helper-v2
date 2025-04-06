"use server";

import db from "@/db";
import { campaignInvites } from "@/db/schema/campaignInvites";
import { campaignPlayers } from "@/db/schema/campaignPlayers";
import { default as users } from "@/db/schema/users";
import { and, eq } from "drizzle-orm";
import { auth } from "../../../auth"; // Assuming you have auth setup
import { addNotification } from "./notifications";

// 📨 **Send Invite**
export async function sendInvite({
  campaignId,
  userEmail,
}: {
  campaignId: string;
  userEmail: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("User not authenticated");

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, userEmail));

  if (!user) throw new Error("User not found");

  // Insert invite into the database
  await db.insert(campaignInvites).values({
    campaignId,
    invitedUserId: user.id,
    status: "pending",
  });

  // Send notification to invited user
  await addNotification("You have been invited to join a campaign. by " + user.name, "invite", userEmail);
}

// ✅ **Accept Invite**
export async function acceptInvite(inviteId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("User not authenticated");

  // Find invite
  const invite = await db
    .select()
    .from(campaignInvites)
    .where(eq(campaignInvites.id, inviteId))
    .limit(1);
  if (!invite.length) throw new Error("Invite not found");

  // Add player to campaign
  await db.insert(campaignPlayers).values({
    campaignId: invite[0].campaignId as string,
    playerId: session.user.id as string,
  });

  // Update invite status
  await db
    .update(campaignInvites)
    .set({ status: "accepted" })
    .where(eq(campaignInvites.id, inviteId));

  //find campaign
  const campaign = await db.query.campaigns.findFirst({
    where: (c, { eq }) => eq(c.id, invite[0].campaignId as string),
    with: {
      creator: { columns: { email: true } },
      dm: { columns: { email: true } },
    },
  });

  // Send notification to campaign creator and DM
  if (campaign && campaign.creator.email) {
    await addNotification("User " + session.user.name + " has accepted your invitation to join your campaign " + campaign?.name, "invite", campaign?.creator?.email);
  }
  if (campaign && campaign.dm.email) {
    await addNotification("User " + session.user.name + " has accepted your invitation to join your campaign " + campaign?.name, "invite", campaign?.dm?.email);
  }
}

// ❌ **Reject Invite**
export async function rejectInvite(inviteId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("User not authenticated");

  // Update invite status
  await db
    .update(campaignInvites)
    .set({ status: "rejected" })
    .where(eq(campaignInvites.id, inviteId));
}

// 📜 **Get Pending Invites with Campaign Info**
export async function getPendingInvites() {
  const session = await auth();
  if (!session?.user) throw new Error("User not authenticated");

  return await db.query.campaignInvites.findMany({
    where: and(
      eq(campaignInvites.invitedUserId, session.user.id as string),
      eq(campaignInvites.status, "pending")
    ),
    with: {
      campaign: true, // Includes the campaign relation
    },
  });
}
