import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";
import { InferSelectModel, relations } from "drizzle-orm";
import { Campaign, campaigns } from "./campaigns";
import users from "./users";

export const campaignInvites = pgTable("campaign_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id, {
    onDelete: "cascade",
  }),
  invitedUserId: uuid("invited_user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  status: text("status").default("pending"), // "pending", "accepted", "rejected"
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaignInviteRelations = relations(
  campaignInvites,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaignInvites.campaignId],
      references: [campaigns.id],
    }),
    invitedUser: one(users, {
      fields: [campaignInvites.invitedUserId],
      references: [users.id],
    }),
  })
);

export type SelectInviteWithCampaign = InferSelectModel<
  typeof campaignInvites
> & { campaign: Campaign };
