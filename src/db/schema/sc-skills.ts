import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core"

export const scSkills = pgTable("sc_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  ability: text("ability").notNull(), // Will, Health, Resources, Circles, Mindchip
  category: text("category").notNull(), // Crafting, Exploration, Social, Lore, Combat
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type SCSkill = typeof scSkills.$inferSelect
export type NewSCSkill = typeof scSkills.$inferInsert
