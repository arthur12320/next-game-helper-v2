import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  jsonb,
} from "drizzle-orm/pg-core";

export const adventureJournal = pgTable("adventure_journal", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type SelectAdventureJournal = InferSelectModel<typeof adventureJournal>;
export type InsertAdventureJournal = InferInsertModel<typeof adventureJournal>;

// Import users table (you'll need to adjust the import path based on your structure)
import users from "./users";
