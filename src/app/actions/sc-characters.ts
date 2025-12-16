"use server"

import db from "@/db"
import { scCharacters } from "@/db/schema"
import { NewSCCharacter, SCCharacter } from "@/db/schema/sc-character"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "../../../auth"

const DEFAULT_SKILLS: Record<string, number> = {
  // Crafting & Technical
  Electronics: 0,
  Mechanics: 0,
  Engineering: 0,
  Computer: 0,
  Comms: 0,
  Gravitics: 0,
  Demolitions: 0,
  Screens: 0,
  // Exploration & Survival
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
  // Social & Interpersonal
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
  // Lore & Knowledge
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
  // Combat
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
}

export async function createSCCharacter(characterData: Partial<NewSCCharacter>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
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
      .returning()

    revalidatePath("/sc-characters")
    return { success: true, character }
  } catch (error) {
    console.error("Error creating SC character:", error)
    return { success: false, error: "Failed to create character" }
  }
}

export async function fetchSCCharacters() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const userCharacters = await db
      .select()
      .from(scCharacters)
      .orderBy(scCharacters.createdAt)

    return userCharacters
  } catch (error) {
    console.error("Error fetching SC characters:", error)
    return []
  }
}

export async function fetchSCCharacter(characterId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  try {
    const [character] = await db
      .select()
      .from(scCharacters)
      .where(eq(scCharacters.id, characterId))

    return character
  } catch (error) {
    console.error("Error fetching SC character:", error)
    return null
  }
}

export async function updateSCCharacter(characterId: string, updates: Partial<SCCharacter>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const [updated] = await db
      .update(scCharacters)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))
      .returning()

    revalidatePath("/sc-characters")
    revalidatePath(`/sc-characters/${characterId}`)
    return { success: true, character: updated }
  } catch (error) {
    console.error("Error updating SC character:", error)
    return { success: false, error: "Failed to update character" }
  }
}

export async function deleteSCCharacter(characterId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await db.delete(scCharacters).where(eq(scCharacters.id, characterId))

    revalidatePath("/sc-characters")
    return { success: true }
  } catch (error) {
    console.error("Error deleting SC character:", error)
    return { success: false, error: "Failed to delete character" }
  }
}

// Play mode actions for updating conditions and abilities
export async function updateSCCondition(
  characterId: string,
  condition: keyof SCCharacter["conditions"],
  value: boolean,
) {
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

    const updatedConditions = {
      ...character.conditions,
      [condition]: value,
    }

    await db
      .update(scCharacters)
      .set({
        conditions: updatedConditions,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true }
  } catch (error) {
    console.error("Error updating condition:", error)
    return { success: false, error: "Failed to update condition" }
  }
}

export async function updateSCAbility(characterId: string, ability: keyof SCCharacter["abilities"], value: number) {
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

    const updatedAbilities = {
      ...character.abilities,
      [ability]: value,
    }

    await db
      .update(scCharacters)
      .set({
        abilities: updatedAbilities,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true }
  } catch (error) {
    console.error("Error updating ability:", error)
    return { success: false, error: "Failed to update ability" }
  }
}

export async function updateSCSkill(characterId: string, skill: string, value: number) {
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

    const updatedSkills = {
      ...character.skills,
      [skill]: value,
    }

    await db
      .update(scCharacters)
      .set({
        skills: updatedSkills,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true }
  } catch (error) {
    console.error("Error updating skill:", error)
    return { success: false, error: "Failed to update skill" }
  }
}

export async function updateSCTokens(
  characterId: string,
  tokenType: "interventionTokens" | "heroTokens",
  value: number,
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await db
      .update(scCharacters)
      .set({
        [tokenType]: value,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true }
  } catch (error) {
    console.error("Error updating tokens:", error)
    return { success: false, error: "Failed to update tokens" }
  }
}

export async function recordSkillTest(characterId: string, skill: string, success: boolean) {
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

    const currentTests = character.skillTests || {}
    const skillTest = currentTests[skill] || { successes: 0, failures: 0 }

    if (success) {
      skillTest.successes += 1
    } else {
      skillTest.failures += 1
    }

    const updatedTests = {
      ...currentTests,
      [skill]: skillTest,
    }

    await db
      .update(scCharacters)
      .set({
        skillTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true, skillTest }
  } catch (error) {
    console.error("Error recording skill test:", error)
    return { success: false, error: "Failed to record skill test" }
  }
}

export async function updateSkillTest(characterId: string, skill: string, successes: number, failures: number) {
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

    const currentTests = character.skillTests || {}
    const updatedTests = {
      ...currentTests,
      [skill]: {
        successes: Math.max(0, successes),
        failures: Math.max(0, failures),
      },
    }

    await db
      .update(scCharacters)
      .set({
        skillTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true }
  } catch (error) {
    console.error("Error updating skill test:", error)
    return { success: false, error: "Failed to update skill test" }
  }
}

export async function updateSCSkillLevel(characterId: string, skill: string, newLevel: number) {
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

    const updatedSkills = {
      ...character.skills,
      [skill]: Math.max(0, newLevel),
    }

    // Reset skill test counts when level changes
    const currentTests = character.skillTests || {}
    const updatedTests = {
      ...currentTests,
      [skill]: { successes: 0, failures: 0 },
    }

    await db
      .update(scCharacters)
      .set({
        skills: updatedSkills,
        skillTests: updatedTests,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true }
  } catch (error) {
    console.error("Error updating skill level:", error)
    return { success: false, error: "Failed to update skill level" }
  }
}

// Inventory management actions
export async function addInventoryItem(characterId: string, itemName: string) {
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

    const currentInventory = character.inventory || []
    const updatedInventory = [...currentInventory, itemName]

    await db
      .update(scCharacters)
      .set({
        inventory: updatedInventory,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true }
  } catch (error) {
    console.error("Error adding inventory item:", error)
    return { success: false, error: "Failed to add item" }
  }
}

export async function updateInventoryItem(characterId: string, index: number, newName: string) {
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

    const currentInventory = character.inventory || []
    const updatedInventory = [...currentInventory]
    updatedInventory[index] = newName

    await db
      .update(scCharacters)
      .set({
        inventory: updatedInventory,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true }
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return { success: false, error: "Failed to update item" }
  }
}

export async function deleteInventoryItem(characterId: string, index: number) {
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

    const currentInventory = character.inventory || []
    const updatedInventory = currentInventory.filter((_, i) => i !== index)

    await db
      .update(scCharacters)
      .set({
        inventory: updatedInventory,
        updatedAt: new Date(),
      })
      .where(eq(scCharacters.id, characterId))

    revalidatePath(`/sc-characters/${characterId}/play`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}
