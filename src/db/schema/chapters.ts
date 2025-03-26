import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { campaigns } from "./campaigns";
import { posts } from "./posts";

export const chapters = pgTable("chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
});

export const chapterRelations = relations(chapters, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [chapters.campaignId],
    references: [campaigns.id],
  }),
  posts: many(posts), // Placeholder for the posts relation
}));

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;