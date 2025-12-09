"use server";

import db from "@/db";
import { maps } from "@/db/schema/maps";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";

// Helper function to generate OTFBM URL
function generateOTFBMUrl(
  size: string,
  tokens: string,
  cellSize?: number,
  backgroundMode?: string,
  backgroundUrl?: string
): string {
  let url = `https://otfbm.io/${size}`;

  // Add cell size if provided (format: @c70 for 70px cells)
  if (cellSize && cellSize > 0) {
    url += `/@c${cellSize}`;
  }

  // Add background mode if dark (format: @d for dark mode)
  if (backgroundMode === "dark") {
    url += "/@d";
  }

  if (tokens.trim()) {
    url += `/${encodeURIComponent(tokens)}`;
  }

  if (backgroundUrl?.trim()) {
    url += `?bg=${encodeURIComponent(backgroundUrl)}`;
  }

  return url;
}

export async function createMap(
  name: string,
  description: string,
  size: string,
  tokens: string,
  cellSize: number,
  backgroundMode: string,
  backgroundUrl?: string,
  campaignId?: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const otfbmUrl = generateOTFBMUrl(
    size,
    tokens,
    cellSize,
    backgroundMode,
    backgroundUrl
  );

  const [map] = await db
    .insert(maps)
    .values({
      name,
      description,
      size,
      cellSize,
      backgroundMode,
      tokens,
      backgroundUrl,
      otfbmUrl,
      userId: session.user.id,
      campaignId: campaignId || null,
    })
    .returning();

  revalidatePath("/maps");
  return { success: true, map };
}

export async function fetchMaps() {
  const session = await auth();
  console.log("hi");

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const query = db.select().from(maps).orderBy(desc(maps.createdAt));

  return await query;
}

export async function updateMap(
  id: string,
  name: string,
  description: string,
  size: string,
  tokens: string,
  cellSize: number,
  backgroundMode: string,
  backgroundUrl?: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const otfbmUrl = generateOTFBMUrl(
    size,
    tokens,
    cellSize,
    backgroundMode,
    backgroundUrl
  );

  const [updatedMap] = await db
    .update(maps)
    .set({
      name,
      description,
      size,
      cellSize,
      backgroundMode,
      tokens,
      backgroundUrl,
      otfbmUrl,
      updatedAt: new Date(),
    })
    .where(and(eq(maps.id, id), eq(maps.userId, session.user.id)))
    .returning();

  revalidatePath("/maps");
  return { success: true, map: updatedMap };
}

export async function deleteMap(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  await db
    .delete(maps)
    .where(and(eq(maps.id, id), eq(maps.userId, session.user.id)));

  revalidatePath("/maps");
  return { success: true };
}

export async function fetchMapById(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const [map] = await db
    .select()
    .from(maps)
    .where(and(eq(maps.id, id), eq(maps.userId, session.user.id)));

  return map;
}
