import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { scCharacters } from "./sc-character";
import { conditions } from "./conditions";
import { relations } from "drizzle-orm";

/**
 * A join table that links characters to the conditions they are currently affected by.
 * This creates a many-to-many relationship between the `sc_characters` and `conditions` tables.
 */
export const characterConditions = pgTable(
  "character_conditions",
  {
    characterId: uuid("character_id")
      .notNull()
      .references(() => scCharacters.id, { onDelete: "cascade" }),
    conditionId: uuid("condition_id")
      .notNull()
      .references(() => conditions.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.characterId, t.conditionId] }),
  }),
);


/**
 * Defines the relations for the `characterConditions` table.
 * This is used by Drizzle ORM to join the `characterConditions` table
 * with the `sc_characters` and `conditions` tables.
 */
export const characterConditionsRelations = relations(
  characterConditions,
  ({ one }) => ({
    character: one(scCharacters, {
      fields: [characterConditions.characterId],
      references: [scCharacters.id],
    }),
    condition: one(conditions, {
      fields: [characterConditions.conditionId],
      references: [conditions.id],
    }),
  }),
);
