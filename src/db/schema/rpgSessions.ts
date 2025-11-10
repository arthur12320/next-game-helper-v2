import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";
import users from "./users";

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
  notes: jsonb("notes")
    .notNull()
    .default('{"events": [], "npcs": [], "locations": [], "generalNotes": ""}'),
  summary: text("summary"),
  lastModifiedBy: uuid("last_modified_by").references(() => users.id),
  lastModifiedByName: text("last_modified_by_name"),
  activeUsers: jsonb("active_users").notNull().default("[]"), // Array of {userId, userName, lastSeen}
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Session = typeof rpgsessions.$inferSelect;
export type NewSession = typeof rpgsessions.$inferInsert;

export interface SessionNotes {
  events: Array<{ timestamp: string; description: string }>;
  npcs: Array<{ name: string; notes: string }>;
  locations: Array<{ name: string; notes: string }>;
  generalNotes: string;
}

export interface ActiveUser {
  userId: string;
  userName: string;
  lastSeen: string;
}

export const sessionPresence = pgTable(
  "session_presence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .references(() => rpgsessions.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    userName: text("user_name").notNull(),
    lastSeen: timestamp("last_seen").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueSessionUser: uniqueIndex("unique_session_user").on(
      table.sessionId,
      table.userId
    ),
  })
);

export type SessionPresence = typeof sessionPresence.$inferSelect;
export type NewSessionPresence = typeof sessionPresence.$inferInsert;
