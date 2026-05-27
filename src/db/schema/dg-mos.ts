import { pgTable, text, uuid, timestamp, jsonb, integer } from "drizzle-orm/pg-core"

export const dgMos = pgTable("dg_mos", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  bonds: integer("bonds").notNull().default(3),
  skills: jsonb("skills").notNull().$type<Record<string, number>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type DGMoS = typeof dgMos.$inferSelect
export type NewDGMoS = typeof dgMos.$inferInsert
