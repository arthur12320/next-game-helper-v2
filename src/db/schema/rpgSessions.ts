import { pgTable, text, timestamp, integer, uuid, jsonb } from "drizzle-orm/pg-core"
import { campaigns } from "./campaigns"
import users from "./users"

export const rpgsessions = pgTable("rpgsessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .references(() => campaigns.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  sessionNumber: integer("session_number").notNull(),
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("in_progress"), // "in_progress" | "completed"
  notes: jsonb("notes").notNull().default('{"events": [], "npcs": [], "locations": [], "generalNotes": ""}'),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Session = typeof rpgsessions.$inferSelect
export type NewSession = typeof rpgsessions.$inferInsert

export interface SessionNotes {
  events: Array<{ timestamp: string; description: string }>
  npcs: Array<{ name: string; notes: string }>
  locations: Array<{ name: string; notes: string }>
  generalNotes: string
}
