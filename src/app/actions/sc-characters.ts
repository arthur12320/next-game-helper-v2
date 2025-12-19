"use server";

import db from "@/db";
import { scCharacters } from "@/db/schema";
import { NewSCCharacter, SCCharacter } from "@/db/schema/sc-character";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import { scSkills } from "@/db/schema/sc-skills";

const DEFAULT_SKILLS: Record<string, number> = {
  // Crafting & Technical (all use Health for fine motor skills)
  Electronics: 0,
  Mechanics: 0,
  Engineering: 0,
  Computer: 0,
  Comms: 0,
  Gravitics: 0,
  Demolitions: 0,
  Screens: 0,
  // Exploration & Survival (mostly Health for physical)
  Athletics: 0,
  "Zero-G": 0,
  Survival: 0,
  Recon: 0,
  Navigation: 0,
  "Grav Vehicle": 0,
  "Wheeled Vehicle": 0,
  "Tracked Vehicle": 0,
  Riding: 0,
  "Winged Aircraft": 0,
  "Rotor Aircraft": 0,
  Motorboats: 0,
  "Ocean Ships": 0,
  "Sailing Ships": 0,
  Submarine: 0,
  Mole: 0,
  // Social & Interpersonal (mostly Will for social interaction)
  Leadership: 0,
  Instruction: 0,
  Barter: 0,
  Diplomacy: 0,
  Etiquette: 0,
  Streetwise: 0,
  Intimidation: 0,
  Deception: 0,
  Seduction: 0,
  Performance: 0,
  Empathy: 0,
  Willpower: 0,
  // Lore & Knowledge (mostly Mindchip for knowledge)
  Ecology: 0,
  Genetics: 0,
  Botanics: 0,
  Zoology: 0,
  Mathematics: 0,
  Chemistry: 0,
  Geology: 0,
  Physics: 0,
  History: 0,
  Psychology: 0,
  Economics: 0,
  Sociology: 0,
  Astronomy: 0,
  "First Aid": 0,
  Surgery: 0,
  Pharmacology: 0,
  Linguistics: 0,
  "Military Strategy": 0,
  "Combat Tactics": 0,
  "Veterinary Medicine": 0,
  // Combat (mostly Health for physical combat)
  Archery: 0,
  "Bludgeoning Weapons": 0,
  "Natural Weapons": 0,
  "Piercing Weapons": 0,
  "Slashing Weapons": 0,
  Shotgun: 0,
  "Slug Pistol": 0,
  "Slug Rifle": 0,
  "Energy Pistol": 0,
  "Energy Rifle": 0,
  "Heavy Weapons": 0,
  "Mounted Weapons": 0,
  "Battle Dress": 0,
};

/**
 * Creates a new Special Circumstances character for the authenticated user.
 * Initializes the character with default values if not provided.
 * @param characterData - Partial data for the new character.
 * @returns An object with the success status and the created character, or an error message.
 */
export async function createSCCharacter(
  characterData: Partial<NewSCCharacter>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .insert(scCharacters)
      .values({
        userId: session.user.id,
        name: characterData.name || "New Agent",
        pronouns: characterData.pronouns || "",
        concept: characterData.concept || "",
        abilities: characterData.abilities || {
          Will: 3,
          Health: 5,
          Resources: 1,
          Circles: 1,
          Mindchip: 1,
        },
        skills: characterData.skills || DEFAULT_SKILLS,
        homeworld: characterData.homeworld || "",
        upbringing: characterData.upbringing || "",
        lifepaths: characterData.lifepaths || [],
        beliefs: characterData.beliefs || "",
        instincts: characterData.instincts || "",
        goals: characterData.goals || "",
      })
      .returning();

    revalidatePath("/sc-characters");
    return { success: true, character };
  } catch (error) {
    console.error("Error creating SC character:", error);
    return { success: false, error: "Failed to create character" };
  }
}


/**
 * Fetches all Special Circumstances characters for the authenticated user.
 * @returns A list of characters, or an empty list if an error occurs.
 */
export async function fetchSCCharacters() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const userCharacters = await db
      .select()
      .from(scCharacters)
      .orderBy(scCharacters.createdAt);

    return userCharacters;
  } catch (error) {
    console.error("Error fetching SC characters:", error);
    return [];
  }
}


/**
 * Fetches a single Special Circumstances character by its ID.
 * @param characterId - The ID of the character to fetch.
 * @returns The character object, or null if not found or an error occurs.
 */
export async function fetchSCCharacter(characterId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    return character;
  } catch (error) {
    console.error("Error fetching SC character:", error);
    return null;
  }
}


/**
 * Updates a Special Circumstances character with new data.
 * @param characterId - The ID of the character to update.
 * @param updates - An object with the fields to update.
 * @returns An object with the success status and the updated character, or an error message.
 */
export async function updateSCCharacter(
  characterId: string,
  updates: Partial<SCCharacter>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [updated] = await db
      .update(scCharacters)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))
      .returning();

    revalidatePath("/sc-characters");
    revalidatePath(`/sc-characters/${characterId}`);
    return { success: true, character: updated };
  } catch (error) {
    console.error("Error updating SC character:", error);
    return { success: false, error: "Failed to update character" };
  }
}


/**
 * Deletes a Special Circumstances character.
 * @param characterId - The ID of the character to delete.
 * @returns An object with the success status, or an error message.
 */
export async function deleteSCCharacter(characterId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.delete(scCharacters).where(eq(scCharacters.id, characterId));

    revalidatePath("/sc-characters");
    return { success: true };
  } catch (error) {
    console.error("Error deleting SC character:", error);
    return { success: false, error: "Failed to delete character" };
  }
}

// Play mode actions for updating conditions and abilities

/**
 * Updates a specific ability score for a character.
 * @param characterId - The ID of the character.
 * @param ability - The name of the ability to update.
 * @param value - The new value for the ability.
 * @returns An object with the success status, or an error message.
 */
export async function updateSCAbility(
  characterId: string,
  ability: keyof SCCharacter["abilities"],
  value: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const updatedAbilities = {
      ...character.abilities,
      [ability]: value,
    };

    await db
      .update(scCharacters)
      .set({
        abilities: updatedAbilities,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error updating ability:", error);
    return { success: false, error: "Failed to update ability" };
  }
}


/**
 * Records the result of a skill test and handles skill advancement.
 * @param characterId - The ID of the character.
 * @param skillId - The ID of the skill being tested.
 * @param success - Whether the test was a success or failure.
 * @returns An object with the success status, the updated skill test data, and advancement details.
 */
export async function recordSkillTest(
  characterId: string,
  skillId: string,
  success: boolean
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    const skills = await db.select().from(scSkills);

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const currentTests = character.skillTests || {};
    const skillTest = currentTests[skillId] || { successes: 0, failures: 0 };

    if (success) {
      skillTest.successes += 1;
    } else {
      skillTest.failures += 1;
    }

    const currentSkills = character.skills;
    const currentSkillLevel =
      currentSkills[skillId as keyof typeof currentSkills];
    let leveledUp = false;
    let newLevel = currentSkillLevel;

    // If successes >= current level, advance the ability
    if (
      currentSkillLevel > 0 &&
      skillTest.successes >= currentSkillLevel &&
      skillTest.failures >= Math.floor(currentSkillLevel / 2)
    ) {
      console.log("leveled up");
      newLevel = currentSkillLevel + 1;
      leveledUp = true;

      // Reset successes and failures after advancement
      skillTest.successes = 0;
      skillTest.failures = 0;

      // Update the ability level
      currentSkills[skillId as keyof typeof currentSkills] = newLevel;
    } else if (currentSkillLevel === 0) {
      const specificSkill = skills.find((value) => value.name == skillId);
      const requiredLearningTests =
        6 -
        (character.abilities[
          specificSkill?.ability as keyof typeof character.abilities
        ] |
          0);
      if (skillTest.failures + skillTest.successes >= requiredLearningTests) {
        console.log("leveled up");
        newLevel = currentSkillLevel + 1;
        leveledUp = true;

        // Reset successes and failures after advancement
        skillTest.successes = 0;
        skillTest.failures = 0;

        // Update the ability level
        currentSkills[skillId as keyof typeof currentSkills] = newLevel;
      }
    }

    const updatedTests = {
      ...currentTests,
      [skillId]: skillTest,
    };

    await db
      .update(scCharacters)
      .set({
        ...(leveledUp && { skills: currentSkills }),
        skillTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    revalidatePath(`/sc-characters`);

    return {
      success: true,
      skillTest,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
    };
  } catch (error) {
    console.error("Error recording skill test:", error);
    return { success: false, error: "Failed to record skill test" };
  }
}


/**
 * Manually updates the success and failure counts for a skill test.
 * @param characterId - The ID of the character.
 * @param skillId - The ID of the skill.
 * @param successes - The new number of successes.
 * @param failures - The new number of failures.
 * @returns An object with the success status, or an error message.
 */
export async function updateSkillTest(
  characterId: string,
  skillId: string,
  successes: number,
  failures: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const currentTests = character.skillTests || {};
    const updatedTests = {
      ...currentTests,
      [skillId]: {
        successes: Math.max(0, successes),
        failures: Math.max(0, failures),
      },
    };

    await db
      .update(scCharacters)
      .set({
        skillTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error updating skill test:", error);
    return { success: false, error: "Failed to update skill test" };
  }
}


/**
 * Manually sets the level of a skill and resets its test counts.
 * @param characterId - The ID of the character.
 * @param skillId - The ID of the skill.
 * @param newLevel - The new level for the skill.
 * @returns An object with the success status, or an error message.
 */
export async function updateSCSkillLevel(
  characterId: string,
  skillId: string,
  newLevel: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const updatedSkills = {
      ...character.skills,
      [skillId]: Math.max(0, newLevel),
    };

    // Reset skill test counts when level changes
    const currentTests = character.skillTests || {};
    const updatedTests = {
      ...currentTests,
      [skillId]: { successes: 0, failures: 0 },
    };

    await db
      .update(scCharacters)
      .set({
        skills: updatedSkills,
        skillTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error updating skill level:", error);
    return { success: false, error: "Failed to update skill level" };
  }
}

// Play mode actions for updating abilities and their tests
/**
 * Records the result of an ability test and handles ability advancement.
 * @param characterId - The ID of the character.
 * @param ability - The name of the ability being tested.
 * @param success - Whether the test was a success or failure.
 * @returns An object with the success status, the updated ability test data, and advancement details.
 */
export async function recordAbilityTest(
  characterId: string,
  ability: string,
  success: boolean
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const currentTests = character.abilityTests || {};
    const abilityTest = currentTests[ability] || { successes: 0, failures: 0 };

    if (success) {
      abilityTest.successes += 1;
    } else {
      abilityTest.failures += 1;
    }

    const currentAbilities = character.abilities;
    const currentAbilityLevel =
      currentAbilities[ability as keyof typeof currentAbilities] || 1;
    let leveledUp = false;
    let newLevel = currentAbilityLevel;

    // If successes >= current level, advance the ability
    if (
      abilityTest.successes >= currentAbilityLevel &&
      abilityTest.failures >= Math.floor(currentAbilityLevel / 2)
    ) {
      newLevel = currentAbilityLevel + 1;
      leveledUp = true;

      // Reset successes and failures after advancement
      abilityTest.successes = 0;
      abilityTest.failures = 0;

      // Update the ability level
      currentAbilities[ability as keyof typeof currentAbilities] = newLevel;
    }

    const updatedTests = {
      ...currentTests,
      [ability]: abilityTest,
    };

    await db
      .update(scCharacters)
      .set({
        ...(leveledUp && { abilities: currentAbilities }),
        abilityTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    revalidatePath(`/sc-characters`);
    return {
      success: true,
      abilityTest,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
    };
  } catch (error) {
    console.error("Failed to record ability test:", error);
    return { success: false, error: "Failed to record ability test" };
  }
}


/**
 * Manually updates the success and failure counts for an ability test.
 * @param characterId - The ID of the character.
 * @param ability - The name of the ability.
 * @param successes - The new number of successes.
 * @param failures - The new number of failures.
 * @returns An object with the success status, or an error message.
 */
export async function updateAbilityTest(
  characterId: string,
  ability: string,
  successes: number,
  failures: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const currentTests = character.abilityTests || {};
    const updatedTests = {
      ...currentTests,
      [ability]: {
        successes: Math.max(0, successes),
        failures: Math.max(0, failures),
      },
    };

    await db
      .update(scCharacters)
      .set({
        abilityTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error updating ability test:", error);
    return { success: false, error: "Failed to update ability test" };
  }
}


/**
 * Manually sets the level of an ability and resets its test counts.
 * @param characterId - The ID of the character.
 * @param ability - The name of the ability.
 * @param newLevel - The new level for the ability.
 * @returns An object with the success status, or an error message.
 */
export async function updateSCAbilityLevel(
  characterId: string,
  ability: string,
  newLevel: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const updatedAbilities = {
      ...character.abilities,
      [ability]: Math.max(0, newLevel),
    };

    // Reset ability test counts when level changes
    const currentTests = character.abilityTests || {};
    const updatedTests = {
      ...currentTests,
      [ability]: { successes: 0, failures: 0 },
    };

    await db
      .update(scCharacters)
      .set({
        abilities: updatedAbilities,
        abilityTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error updating ability level:", error);
    return { success: false, error: "Failed to update ability level" };
  }
}

// Inventory management actions
/**
 * Adds an item to a character's inventory.
 * @param characterId - The ID of the character.
 * @param itemName - The name of the item to add.
 * @returns An object with the success status, or an error message.
 */
export async function addInventoryItem(characterId: string, itemName: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const currentInventory = character.inventory || [];
    const updatedInventory = [...currentInventory, itemName];

    await db
      .update(scCharacters)
      .set({
        inventory: updatedInventory,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error adding inventory item:", error);
    return { success: false, error: "Failed to add item" };
  }
}


/**
 * Updates an item in a character's inventory.
 * @param characterId - The ID of the character.
 * @param index - The index of the item to update.
 * @param newName - The new name for the item.
 * @returns An object with the success status, or an error message.
 */
export async function updateInventoryItem(
  characterId: string,
  index: number,
  newName: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const currentInventory = character.inventory || [];
    const updatedInventory = [...currentInventory];
    updatedInventory[index] = newName;

    await db
      .update(scCharacters)
      .set({
        inventory: updatedInventory,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return { success: false, error: "Failed to update item" };
  }
}


/**
 * Deletes an item from a character's inventory.
 * @param characterId - The ID of the character.
 * @param index - The index of the item to delete.
 * @returns An object with the success status, or an error message.
 */
export async function deleteInventoryItem(characterId: string, index: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const currentInventory = character.inventory || [];
    const updatedInventory = currentInventory.filter((_, i) => i !== index);

    await db
      .update(scCharacters)
      .set({
        inventory: updatedInventory,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

// Custom skill management actions
/**
 * Adds a new custom skill to a character.
 * @param characterId - The ID of the character.
 * @param skillName - The name of the new skill.
 * @returns An object with the success status, or an error message.
 */
export async function addCustomSkill(characterId: string, skillName: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    if (character.skills[skillName]) {
      return { success: false, error: "Skill already exists" };
    }

    const updatedSkills = {
      ...character.skills,
      [skillName]: 0,
    };

    await db
      .update(scCharacters)
      .set({
        skills: updatedSkills,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error adding custom skill:", error);
    return { success: false, error: "Failed to add skill" };
  }
}


/**
 * Updates the name of a custom skill and transfers its test history.
 * @param characterId - The ID of the character.
 * @param oldSkillName - The current name of the skill.
 * @param newSkillName - The new name for the skill.
 * @returns An object with the success status, or an error message.
 */
export async function updateCustomSkill(
  characterId: string,
  oldSkillName: string,
  newSkillName: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const oldSkill = character.skills[oldSkillName];
    if (!oldSkill) {
      return { success: false, error: "Skill not found" };
    }

    const updatedSkills = { ...character.skills };
    delete updatedSkills[oldSkillName];
    updatedSkills[newSkillName] = oldSkill;

    // Transfer test history if skill name changed
    const currentTests = character.skillTests || {};
    const updatedTests = { ...currentTests };
    if (oldSkillName !== newSkillName && currentTests[oldSkillName]) {
      updatedTests[newSkillName] = currentTests[oldSkillName];
      delete updatedTests[oldSkillName];
    }

    await db
      .update(scCharacters)
      .set({
        skills: updatedSkills,
        skillTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error updating custom skill:", error);
    return { success: false, error: "Failed to update skill" };
  }
}


/**
 * Deletes a custom skill and its associated test history.
 * @param characterId - The ID of the character.
 * @param skillName - The name of the skill to delete.
 * @returns An object with the success status, or an error message.
 */
export async function deleteCustomSkill(
  characterId: string,
  skillName: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId));

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    const updatedSkills = { ...character.skills };
    delete updatedSkills[skillName];

    // Also remove test history
    const currentTests = character.skillTests || {};
    const updatedTests = { ...currentTests };
    delete updatedTests[skillName];

    await db
      .update(scCharacters)
      .set({
        skills: updatedSkills,
        skillTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId));

    revalidatePath(`/sc-characters/${characterId}/play`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting custom skill:", error);
    return { success: false, error: "Failed to delete skill" };
  }
}

// Mindchip boost management actions
/**
 * Updates or removes a Mindchip boost for a specific skill.
 * Validates that the total boosts do not exceed the character's Mindchip level.
 * @param characterId - The ID of the character.
 * @param skillName - The name of the skill to boost.
 * @param boostAmount - The amount to boost the skill by (0 to remove).
 * @returns An object with the success status and the total boosts used, or an error message.
 */
export async function updateMindchipBoost(characterId: string, skillName: string, boostAmount: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId))

    if (!character) {
      return { success: false, error: "Character not found" }
    }

    const mindchipLevel = character.abilities.Mindchip
    const currentBoosts = character.mindchipBoosts || {}

    // Calculate total boosts being used
    const totalBoosts =
      Object.values(currentBoosts).reduce((sum, val) => sum + val, 0) - (currentBoosts[skillName] || 0) + boostAmount

    // Validate: total boosts cannot exceed Mindchip level
    if (totalBoosts > mindchipLevel) {
      return { success: false, error: `Cannot exceed Mindchip level (${mindchipLevel})` }
    }

    // Validate: individual boost cannot be negative or exceed reasonable limits
    if (boostAmount < 0 || boostAmount > mindchipLevel) {
      return { success: false, error: "Invalid boost amount" }
    }

    const updatedBoosts = { ...currentBoosts }
    if (boostAmount === 0) {
      delete updatedBoosts[skillName]
    } else {
      updatedBoosts[skillName] = boostAmount
    }

    await db
      .update(scCharacters)
      .set({
        mindchipBoosts: updatedBoosts,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    revalidatePath(`/sc-characters`)
    return { success: true, totalBoosts: Object.values(updatedBoosts).reduce((sum, val) => sum + val, 0) }
  } catch (error) {
    console.error("Error updating mindchip boost:", error)
    return { success: false, error: "Failed to update mindchip boost" }
  }
}
