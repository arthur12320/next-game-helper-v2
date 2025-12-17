import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core"

export const globalTokens = pgTable("global_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  interventionTokens: integer("intervention_tokens").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type GlobalTokens = typeof globalTokens.$inferSelect
export type NewGlobalTokens = typeof globalTokens.$inferInsert
