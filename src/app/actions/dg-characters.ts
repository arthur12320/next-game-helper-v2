"use server"

import db from "@/db"
import { dgCharacters } from "@/db/schema"
import { DGCharacter, NewDGCharacter } from "@/db/schema/dg-character"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "../../../auth"
import { DEFAULT_DG_SKILLS, calcDerived } from "@/lib/dg-data"

export async function createDGCharacter(characterData: Partial<NewDGCharacter>) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const stats = characterData.stats || { STR: 10, CON: 10, DEX: 10, INT: 10, POW: 10, CHA: 12 }
  const derived = calcDerived(stats)

  try {
    const [character] = await db
      .insert(dgCharacters)
      .values({
        userId: session.user.id,
        name: characterData.name || "New Agent",
        profession: characterData.profession || "Sniper",
        employer: characterData.employer || "",
        nationality: characterData.nationality || "American",
        sex: characterData.sex || "",
        age: characterData.age || "",
        dob: characterData.dob || "",
        educationHistory: characterData.educationHistory || "",
        physicalDescription: characterData.physicalDescription || "",
        stats,
        derivedMax: derived,
        derivedCurrent: { HP: derived.HP, WP: derived.WP, SAN: derived.SAN },
        skills: characterData.skills || DEFAULT_DG_SKILLS,
        skillChecks: {},
        bonds: characterData.bonds || [],
        motivations: characterData.motivations || [],
        woundsAndAilments: "",
        armorAndGear: "",
        weapons: [],
        personalDetails: "",
        homeAndFamily: "",
        specialTraining: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    revalidatePath("/dg-characters")
    return { success: true, character }
  } catch (error) {
    console.error("Error creating DG character:", error)
    return { success: false, error: "Failed to create character" }
  }
}

export async function fetchDGCharacters() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db
    .select()
    .from(dgCharacters)
    .where(eq(dgCharacters.userId, session.user.id))
}

export async function fetchDGCharacter(id: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const [character] = await db
    .select()
    .from(dgCharacters)
    .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

  return character || null
}

export async function updateDGCharacter(id: string, data: Partial<DGCharacter>) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [updated] = await db
      .update(dgCharacters)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))
      .returning()

    revalidatePath(`/dg-characters/${id}`)
    revalidatePath("/dg-characters")
    return { success: true, character: updated }
  } catch (error) {
    console.error("Error updating DG character:", error)
    return { success: false, error: "Failed to update character" }
  }
}

export async function deleteDGCharacter(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    await db
      .delete(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    revalidatePath("/dg-characters")
    return { success: true }
  } catch (error) {
    console.error("Error deleting DG character:", error)
    return { success: false, error: "Failed to delete character" }
  }
}

export async function updateDGStats(
  id: string,
  stats: { STR: number; CON: number; DEX: number; INT: number; POW: number; CHA: number }
) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const derived = calcDerived(stats)

  try {
    const [updated] = await db
      .update(dgCharacters)
      .set({ stats, derivedMax: derived, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))
      .returning()

    revalidatePath(`/dg-characters/${id}`)
    return { success: true, character: updated }
  } catch (error) {
    console.error("Error updating DG stats:", error)
    return { success: false, error: "Failed to update stats" }
  }
}

export async function updateDGDerivedCurrent(
  id: string,
  current: { HP?: number; WP?: number; SAN?: number }
) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [existing] = await db
      .select()
      .from(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    if (!existing) return { success: false, error: "Character not found" }

    const newCurrent = { ...existing.derivedCurrent, ...current }

    const [updated] = await db
      .update(dgCharacters)
      .set({ derivedCurrent: newCurrent, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))
      .returning()

    return { success: true, character: updated }
  } catch (error) {
    console.error("Error updating derived current:", error)
    return { success: false, error: "Failed to update" }
  }
}

export async function toggleSkillCheck(id: string, skill: string, checked: boolean) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [existing] = await db
      .select()
      .from(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    if (!existing) return { success: false, error: "Character not found" }

    const newChecks = { ...existing.skillChecks, [skill]: checked }

    await db
      .update(dgCharacters)
      .set({ skillChecks: newChecks, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    return { success: true }
  } catch (error) {
    console.error("Error toggling skill check:", error)
    return { success: false, error: "Failed to toggle skill check" }
  }
}

export async function endDGSession(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [existing] = await db
      .select()
      .from(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    if (!existing) return { success: false, error: "Character not found" }

    const results: Array<{ skill: string; roll: number; newValue: number }> = []
    const newSkills = { ...existing.skills }
    const newChecks: Record<string, boolean> = {}

    for (const [skill, checked] of Object.entries(existing.skillChecks)) {
      if (checked && existing.skills[skill] !== undefined) {
        const roll = Math.floor(Math.random() * 4) + 1
        const newValue = Math.min(99, (newSkills[skill] ?? 0) + roll)
        newSkills[skill] = newValue
        results.push({ skill, roll, newValue })
      }
    }

    await db
      .update(dgCharacters)
      .set({ skills: newSkills, skillChecks: newChecks, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    revalidatePath(`/dg-characters/${id}/play`)
    return { success: true, results }
  } catch (error) {
    console.error("Error ending DG session:", error)
    return { success: false, error: "Failed to process end of session" }
  }
}

export async function applyDGSessionAdvancement(
  id: string,
  rolls: Record<string, number>
) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [existing] = await db
      .select()
      .from(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    if (!existing) return { success: false, error: "Character not found" }

    const results: Array<{ skill: string; roll: number; newValue: number }> = []
    const newSkills = { ...existing.skills }
    const newChecks: Record<string, boolean> = {}

    for (const [skill, roll] of Object.entries(rolls)) {
      if (existing.skills[skill] !== undefined) {
        const newValue = Math.min(99, (newSkills[skill] ?? 0) + roll)
        newSkills[skill] = newValue
        results.push({ skill, roll, newValue })
      }
    }

    await db
      .update(dgCharacters)
      .set({ skills: newSkills, skillChecks: newChecks, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    revalidatePath(`/dg-characters/${id}/play`)
    return { success: true, results }
  } catch (error) {
    console.error("Error applying DG session advancement:", error)
    return { success: false, error: "Failed to apply session advancement" }
  }
}

export async function updateDGBond(id: string, bondId: string, delta: number) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [existing] = await db
      .select()
      .from(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    if (!existing) return { success: false, error: "Character not found" }

    const newBonds = existing.bonds.map((b) => {
      if (b.id !== bondId) return b
      const newScore = Math.max(0, b.score + delta)
      return { ...b, score: newScore, broken: newScore === 0 }
    })

    await db
      .update(dgCharacters)
      .set({ bonds: newBonds, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    return { success: true, bonds: newBonds }
  } catch (error) {
    console.error("Error updating bond:", error)
    return { success: false, error: "Failed to update bond" }
  }
}

export async function addDGBond(id: string, name: string, score: number) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [existing] = await db
      .select()
      .from(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    if (!existing) return { success: false, error: "Character not found" }

    const newBond = { id: crypto.randomUUID(), name, score, broken: false }
    const newBonds = [...existing.bonds, newBond]

    await db
      .update(dgCharacters)
      .set({ bonds: newBonds, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    return { success: true, bonds: newBonds }
  } catch (error) {
    console.error("Error adding bond:", error)
    return { success: false, error: "Failed to add bond" }
  }
}

export async function removeDGBond(id: string, bondId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [existing] = await db
      .select()
      .from(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    if (!existing) return { success: false, error: "Character not found" }

    const newBonds = existing.bonds.filter((b) => b.id !== bondId)

    await db
      .update(dgCharacters)
      .set({ bonds: newBonds, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    return { success: true }
  } catch (error) {
    console.error("Error removing bond:", error)
    return { success: false, error: "Failed to remove bond" }
  }
}

export async function addDGMotivation(id: string, text: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [existing] = await db
      .select()
      .from(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    if (!existing) return { success: false, error: "Character not found" }
    if (existing.motivations.length >= 5) return { success: false, error: "Maximum 5 motivations" }

    const newMotivations = [...existing.motivations, text]

    await db
      .update(dgCharacters)
      .set({ motivations: newMotivations, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    return { success: true, motivations: newMotivations }
  } catch (error) {
    console.error("Error adding motivation:", error)
    return { success: false, error: "Failed to add motivation" }
  }
}

export async function removeDGMotivation(id: string, index: number) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const [existing] = await db
      .select()
      .from(dgCharacters)
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    if (!existing) return { success: false, error: "Character not found" }

    const newMotivations = existing.motivations.filter((_, i) => i !== index)

    await db
      .update(dgCharacters)
      .set({ motivations: newMotivations, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    return { success: true, motivations: newMotivations }
  } catch (error) {
    console.error("Error removing motivation:", error)
    return { success: false, error: "Failed to remove motivation" }
  }
}

export async function updateDGGearAndNotes(
  id: string,
  fields: {
    woundsAndAilments?: string
    armorAndGear?: string
    personalDetails?: string
    homeAndFamily?: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    await db
      .update(dgCharacters)
      .set({ ...fields, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    return { success: true }
  } catch (error) {
    console.error("Error updating gear/notes:", error)
    return { success: false, error: "Failed to update" }
  }
}

export async function updateDGWeapons(
  id: string,
  weapons: Array<{
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
) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    await db
      .update(dgCharacters)
      .set({ weapons, updatedAt: new Date() })
      .where(and(eq(dgCharacters.id, id), eq(dgCharacters.userId, session.user.id)))

    return { success: true }
  } catch (error) {
    console.error("Error updating weapons:", error)
    return { success: false, error: "Failed to update weapons" }
  }
}
