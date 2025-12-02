import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";
import users from "./users";

export const maps = pgTable("maps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  size: text("size").notNull().default("10x10"), // e.g., "10x10", "20x15"
  tokens: text("tokens").notNull().default(""), // e.g., "A1-Fighter/B2-Goblin"
  backgroundUrl: text("background_url"), // Optional background image
  otfbmUrl: text("otfbm_url").notNull(), // Generated OTFBM URL
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").references(() => campaigns.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Map = typeof maps.$inferSelect;
export type NewMap = typeof maps.$inferInsert;
