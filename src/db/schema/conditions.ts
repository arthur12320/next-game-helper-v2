import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Defines the schema for the "conditions" table.
 * This table stores global conditions that can be applied to any character.
 * For example, "Injured", "Exhausted", "On Fire", etc.
 */
export const conditions = pgTable("conditions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
});


export type GlobalCondition = typeof conditions.$inferSelect;