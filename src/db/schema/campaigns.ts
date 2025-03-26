import { pgTable, varchar, uuid, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import  users from "./users"; // Assuming you have a users table defined
import { campaignPlayers } from "./campaignPlayers";

export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  creatorId: uuid("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dmId: uuid("dm_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  description: text("description"),
});

export const campaignRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [campaigns.creatorId],
    references: [users.id],
  }),
  dm: one(users, {
    fields: [campaigns.dmId],
    references: [users.id],
  }),
  players: many(campaignPlayers), // Assuming a many-to-many relation for players
}));

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
