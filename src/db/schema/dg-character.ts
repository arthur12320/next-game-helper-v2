import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import users from "./users"

export const dgCharacters = pgTable("dg_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // --- Personal Data ---
  name: text("name").notNull().default("New Agent"),
  profession: text("profession").default("Sniper"),
  employer: text("employer").default(""),
  nationality: text("nationality").default("American"),
  sex: text("sex").default(""),
  age: text("age").default(""),
  dob: text("dob").default(""),
  educationHistory: text("education_history").default(""),
  physicalDescription: text("physical_description").default(""),

  // --- Statistics (total = 72) ---
  stats: jsonb("stats")
    .notNull()
    .$type<{ STR: number; CON: number; DEX: number; INT: number; POW: number; CHA: number }>()
    .default({ STR: 10, CON: 10, DEX: 10, INT: 10, POW: 10, CHA: 12 }),

  // --- Derived Attributes (max values calculated from stats) ---
  derivedMax: jsonb("derived_max")
    .notNull()
    .$type<{ HP: number; WP: number; SAN: number; BP: number }>()
    .default({ HP: 10, WP: 10, SAN: 50, BP: 40 }),

  // --- Derived Attributes (current tracked during play) ---
  derivedCurrent: jsonb("derived_current")
    .notNull()
    .$type<{ HP: number; WP: number; SAN: number }>()
    .default({ HP: 10, WP: 10, SAN: 50 }),

  // --- Skills (skill name → current percentage) ---
  skills: jsonb("skills").notNull().$type<Record<string, number>>().default({}),

  // --- Skill fail-checks (marked when a skill use fails; cleared after end-session advancement) ---
  skillChecks: jsonb("skill_checks").notNull().$type<Record<string, boolean>>().default({}),

  // --- Bonds ---
  bonds: jsonb("bonds")
    .notNull()
    .$type<Array<{ id: string; name: string; score: number; broken: boolean }>>()
    .default([]),

  // --- Motivations (up to 5) ---
  motivations: jsonb("motivations").notNull().$type<string[]>().default([]),

  // --- Equipment ---
  woundsAndAilments: text("wounds_and_ailments").default(""),
  armorAndGear: text("armor_and_gear").default(""),
  weapons: jsonb("weapons")
    .$type<
      Array<{
        id: string
        name: string
        skillPct: string
        baseRange: string
        damage: string
        armorPiercing: string
        lethality: string
        killRadius: string
        ammo: string
      }>
    >()
    .default([]),

  // --- Remarks / Notes ---
  personalDetails: text("personal_details").default(""),
  homeAndFamily: text("home_and_family").default(""),
  specialTraining: jsonb("special_training")
    .$type<Array<{ training: string; statUsed: string }>>()
    .default([]),

  // --- Timestamps ---
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const dgCharactersRelations = relations(dgCharacters, ({ one }) => ({
  user: one(users, {
    fields: [dgCharacters.userId],
    references: [users.id],
  }),
}))

export type DGCharacter = typeof dgCharacters.$inferSelect
export type NewDGCharacter = typeof dgCharacters.$inferInsert
