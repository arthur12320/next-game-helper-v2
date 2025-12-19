"use server";

import db from "@/db";
import { conditions, characterConditions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Global Conditions CRUD ---

/**
 * Creates a new global condition.
 * @param name - The name of the condition.
 * @param description - A description of the condition's effects.
 * @returns An object with the success status, or an error message.
 */
export async function createCondition(name: string, description: string) {
  try {
    await db.insert(conditions).values({name, description });
    revalidatePath("/conditions"); // Revalidate path for global conditions management
    return { success: true };
  } catch (error) {
    console.error("Error creating condition:", error);
    return { success: false, error: "Failed to create condition" };
  }
}

/**
 * Updates an existing global condition.
 * @param id - The ID of the condition to update.
 * @param name - The new name for the condition.
 * @param description - The new description for the condition.
 * @returns An object with the success status, or an error message.
 */
export async function updateCondition(
  id: string,
  name: string,
  description: string,
) {
  try {
    await db
      .update(conditions)
      .set({ name, description })
      .where(eq(conditions.id, id));
    revalidatePath("/conditions");
    // Also revalidate character pages as this might affect their displayed conditions
    revalidatePath("/sc-characters/[characterId]"); 
    return { success: true };
  } catch (error) {
    console.error("Error updating condition:", error);
    return { success: false, error: "Failed to update condition" };
  }
}

/**
 * Deletes a global condition.
 * @param id - The ID of the condition to delete.
 * @returns An object with the success status, or an error message.
 */
export async function deleteCondition(id: string) {
  try {
    await db.delete(conditions).where(eq(conditions.id, id));
    revalidatePath("/conditions");
    revalidatePath("/sc-characters/[characterId]");
    return { success: true };
  } catch (error) {
    console.error("Error deleting condition:", error);
    return { success: false, error: "Failed to delete condition" };
  }
}

/**
 * Fetches all global conditions from the database.
 * @returns An object with the success status and a list of all conditions, or an error message.
 */
export async function getConditions() {
  try {
    const allConditions = await db.query.conditions.findMany();
    return { success: true, data: allConditions };
  } catch (error) {
    console.error("Error fetching conditions:", error);
    return { success: false, error: "Failed to fetch conditions", data: [] };
  }
}

// --- Character Conditions Management ---

/**
 * Applies a global condition to a specific character.
 * @param characterId - The ID of the character.
 * @param conditionId - The ID of the condition to apply.
 * @returns An object with the success status, or an error message.
 */
export async function addConditionToCharacter(
  characterId: string,
  conditionId: string,
) {
  try {
    await db.insert(characterConditions).values({ characterId, conditionId });
    revalidatePath(`/sc-characters/${characterId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding condition to character:", error);
    return { success: false, error: "Failed to add condition to character" };
  }
}

/**
 * Removes a global condition from a specific character.
 * @param characterId - The ID of the character.
 * @param conditionId - The ID of the condition to remove.
 * @returns An object with the success status, or an error message.
 */
export async function removeConditionFromCharacter(
  characterId: string,
  conditionId: string,
) {
  try {
    await db
      .delete(characterConditions)
      .where(
        and(
          eq(characterConditions.characterId, characterId),
          eq(characterConditions.conditionId, conditionId),
        ),
      );
    revalidatePath(`/sc-characters/${characterId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing condition from character:", error);
    return { success: false, error: "Failed to remove condition from character" };
  }
}

/**
 * Fetches all conditions currently applied to a specific character.
 * @param characterId - The ID of the character.
 * @returns An object with the success status and a list of the character's conditions, or an error message.
 */
export async function getConditionsForCharacter(characterId: string) {
  try {
    const characterConditionsData = await db.query.characterConditions.findMany({
      where: eq(characterConditions.characterId, characterId),
      with: {
        condition: true,
      },
    });
    return { success: true, data: characterConditionsData.map(cc => cc.condition) };
  } catch (error) {
    console.error("Error fetching conditions for character:", error);
    return { success: false, error: "Failed to fetch conditions for character", data: [] };
  }
}
