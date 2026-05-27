"use server"

import db from "@/db"
import { dgMos } from "@/db/schema/dg-mos"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { DGMoS } from "@/db/schema/dg-mos"

const SNIPER_SEED: Omit<DGMoS, "id" | "createdAt" | "updatedAt"> = {
  name: "Sniper",
  bonds: 2,
  skills: {
    Alertness: 60,
    Athletics: 60,
    Search: 60,
    Firearms: 60,
    "Heavy Weapons": 50,
    "Melee Weapons": 40,
    "Military Science (Land)": 60,
    Navigate: 50,
    Stealth: 60,
    Survival: 60,
    Swim: 50,
    "Unarmed Combat": 50,
  },
}

export async function fetchDGMoSList(): Promise<DGMoS[]> {
  const rows = await db.select().from(dgMos).orderBy(dgMos.name)

  if (rows.length === 0) {
    await db.insert(dgMos).values(SNIPER_SEED)
    return db.select().from(dgMos).orderBy(dgMos.name)
  }

  return rows
}

export async function createDGMoS(
  name: string,
  bonds: number,
  skills: Record<string, number>
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.insert(dgMos).values({ name: name.trim(), bonds, skills })
    revalidatePath("/dg-characters")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to create MoS" }
  }
}

export async function updateDGMoS(
  id: string,
  name: string,
  bonds: number,
  skills: Record<string, number>
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(dgMos)
      .set({ name: name.trim(), bonds, skills, updatedAt: new Date() })
      .where(eq(dgMos.id, id))
    revalidatePath("/dg-characters")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update MoS" }
  }
}

export async function deleteDGMoS(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(dgMos).where(eq(dgMos.id, id))
    revalidatePath("/dg-characters")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete MoS" }
  }
}
