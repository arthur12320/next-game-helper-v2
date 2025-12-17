"use server"

import db from "@/db"
import { globalTokens } from "@/db/schema"
import { sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getGlobalTokens() {
  try {
    // Get or create the single global tokens row
    let [tokens] = await db.select().from(globalTokens).limit(1)

    if (!tokens) {
      // Initialize if doesn't exist
      ;[tokens] = await db.insert(globalTokens).values({ interventionTokens: 0 }).returning()
    }

    return { success: true, tokens }
  } catch (error) {
    console.error("Error fetching global tokens:", error)
    return { success: false, error: "Failed to fetch tokens", tokens: null }
  }
}

export async function updateGlobalTokens(delta: number) {
  try {
    // Get the current tokens
    const result = await getGlobalTokens()
    if (!result.success || !result.tokens) {
      return { success: false, error: "Failed to get current tokens" }
    }

    const newValue = Math.max(0, result.tokens.interventionTokens + delta)

    // Update the tokens
    const [updated] = await db
      .update(globalTokens)
      .set({
        interventionTokens: newValue,
        updatedAt: new Date(),
      })
      .where(sql`true`) // Update the single row
      .returning()

    revalidatePath("/sc-characters")
    return { success: true, tokens: updated }
  } catch (error) {
    console.error("Error updating global tokens:", error)
    return { success: false, error: "Failed to update tokens" }
  }
}
