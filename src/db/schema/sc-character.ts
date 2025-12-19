import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import users from "./users"
import { characterConditions } from "./character-conditions"

/**
 * Defines the schema for the "Special Circumstances" characters.
 * This table stores all the information related to a character,
 * including their basic info, abilities, skills, background, and more.
 */
export const scCharacters = pgTable("sc_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // --- Basic Information ---
  name: text("name").notNull().default("New Agent"),
  pronouns: text("pronouns").default(""),
  concept: text("concept").default(""),

  // --- Abilities & Skills ---
  // Stores the character's core abilities, as defined in the game's rules.
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

  // A flexible record of the character's skills and their levels.
  skills: jsonb("skills").notNull().$type<Record<string, number>>().default({}),

  // Stores any temporary boosts applied to skills via the Mindchip.
  mindchipBoosts: jsonb("mindchip_boosts").$type<Record<string, number>>().default({}),


  // --- Advancement Tracking ---
  // Tracks the number of successes and failures for each skill to determine advancement.
  skillTests: jsonb("skill_tests").$type<Record<string, { successes: number; failures: number }>>().default({}),

  // Tracks the number of successes and failures for each ability to determine advancement.
  abilityTests: jsonb("ability_tests").$type<Record<string, { successes: number; failures: number }>>().default({}),

  // --- Character Traits & Background ---
  // Stores pairs of traits that define the character's personality and approach.
  traitPairs: jsonb("trait_pairs").$type<Array<{ trait1: string; trait2: string }>>().default([]),

  homeworld: text("homeworld").default(""),
  upbringing: text("upbringing").default(""),
  lifepaths: jsonb("lifepaths").$type<string[]>().default([]),

  // --- Character Development ---
  beliefs: text("beliefs").default(""),
  instincts: text("instincts").default(""),
  goals: text("goals").default(""),

  // --- Equipment & Notes ---
  inventory: jsonb("inventory").$type<string[]>().default([]),
  notes: text("notes").default(""),

  // --- Timestamps ---
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const scCharactersRelations = relations(scCharacters, ({ one, many }) => ({
  user: one(users, {
    fields: [scCharacters.userId],
    references: [users.id],
  }),
  conditions: many(characterConditions),
}))

export type SCCharacter = typeof scCharacters.$inferSelect
export type NewSCCharacter = typeof scCharacters.$inferInsert
