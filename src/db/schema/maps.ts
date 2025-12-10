import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const maps = pgTable("maps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  size: text("size").notNull().default("10x10"), // e.g., "10x10", "20x15"
  cellSize: integer("cell_size").default(40), // Cell size in pixels, e.g., 40, 70
  backgroundMode: text("background_mode").default("light"), // "light" or "dark"
  tokens: text("tokens").notNull().default(""), // e.g., "A1-Fighter/B2-Goblin"
  backgroundUrl: text("background_url"), // Optional background image
  otfbmUrl: text("otfbm_url").notNull(), // Generated OTFBM URL
  userId: text("user_id").notNull(), // Store user ID as text for now
  campaignId: text("campaign_id"), // Optional campaign association
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Map = typeof maps.$inferSelect;
export type NewMap = typeof maps.$inferInsert;
