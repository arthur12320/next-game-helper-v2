"use server"

import db from "@/db"
import { scSkills } from "@/db/schema/sc-skills"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "../../../auth"

export async function getAllSkills() {
  try {
    const skills = await db.select().from(scSkills).orderBy(scSkills.category, scSkills.name)
    return { success: true, skills }
  } catch (error) {
    console.error("Error fetching skills:", error)
    return { success: false, error: "Failed to fetch skills" }
  }
}

export async function createSkill(data: { name: string; ability: string; category: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required" }
  }

  try {
    const [skill] = await db
      .insert(scSkills)
      .values({
        name: data.name,
        ability: data.ability,
        category: data.category,
      })
      .returning()

    revalidatePath("/sc-characters")
    return { success: true, skill }
  } catch (error) {
    console.error("Error creating skill:", error)
    return { success: false, error: "Failed to create skill" }
  }
}

export async function updateSkill(id: string, data: { name: string; ability: string; category: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required" }
  }

  try {
    const [skill] = await db
      .update(scSkills)
      .set({
        name: data.name,
        ability: data.ability,
        category: data.category,
      })
      .where(eq(scSkills.id, id))
      .returning()

    if (!skill) {
      return { success: false, error: "Skill not found" }
    }

    revalidatePath("/sc-characters")
    return { success: true, skill }
  } catch (error) {
    console.error("Error updating skill:", error)
    return { success: false, error: "Failed to update skill" }
  }
}

export async function deleteSkill(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required" }
  }

  try {
    await db.delete(scSkills).where(eq(scSkills.id, id))

    revalidatePath("/sc-characters")
    return { success: true }
  } catch (error) {
    console.error("Error deleting skill:", error)
    return { success: false, error: "Failed to delete skill" }
  }
}