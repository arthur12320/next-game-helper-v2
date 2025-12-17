import { pgTable, text, uuid, timestamp, jsonb, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import users from "./users"


export const scCharacters = pgTable("sc_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Basic Info
  name: text("name").notNull().default("New Agent"),
  pronouns: text("pronouns").default(""),
  concept: text("concept").default(""),

  // Ref: Chapter Four - Abilities
  abilities: jsonb("abilities")
    .notNull()
    .$type<{
      Will: number
      Health: number
      Resources: number
      Circles: number
      Mindchip: number
    }>()
    .default({
      Will: 3,
      Health: 5,
      Resources: 1,
      Circles: 1,
      Mindchip: 1,
    }),

  skills: jsonb("skills").notNull().$type<Record<string, number>>().default({}),

  // For tracking skill advancement
  skillTests: jsonb("skill_tests").$type<Record<string, { successes: number; failures: number }>>().default({}),

  abilityTests: jsonb("ability_tests").$type<Record<string, { successes: number; failures: number }>>().default({}),

  // Ref: Chapter Two - Trait Pairs
  traitPairs: jsonb("trait_pairs").$type<Array<{ trait1: string; trait2: string }>>().default([]),

  // Meta-Currency
  interventionTokens: integer("intervention_tokens").notNull().default(0),
  heroTokens: integer("hero_tokens").notNull().default(0),

  // Ref: Chapter Eight - Conditions
  conditions: jsonb("conditions")
    .notNull()
    .$type<{
      "Hungry / Thirsty": boolean
      Tired: boolean
      Sad: boolean
      Angry: boolean
      Afraid: boolean
      Sick: boolean
      Hurt: boolean
      "Mentally Fractured": boolean
      "Severely Injured": boolean
    }>()
    .default({
      "Hungry / Thirsty": false,
      Tired: false,
      Sad: false,
      Angry: false,
      Afraid: false,
      Sick: false,
      Hurt: false,
      "Mentally Fractured": false,
      "Severely Injured": false,
    }),

  // Background
  homeworld: text("homeworld").default(""),
  upbringing: text("upbringing").default(""),
  lifepaths: jsonb("lifepaths").$type<string[]>().default([]),

  // Character Development
  beliefs: text("beliefs").default(""),
  instincts: text("instincts").default(""),
  goals: text("goals").default(""),

  // Equipment & Notes
  inventory: jsonb("inventory").$type<string[]>().default([]),
  notes: text("notes").default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const scCharactersRelations = relations(scCharacters, ({ one }) => ({
  user: one(users, {
    fields: [scCharacters.userId],
    references: [users.id],
  }),
}))

export type SCCharacter = typeof scCharacters.$inferSelect
export type NewSCCharacter = typeof scCharacters.$inferInsert
