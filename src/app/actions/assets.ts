"use server";

import db from "@/db";
import { assets } from "@/db/schema";
import { del, put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { auth } from "../../../auth"; // Ensure this fetches the current session


export async function uploadAsset(file: File) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const blob = await put(file.name, file, { access: "public" });

    await db.insert(assets).values({
        url: blob.url,
        name: file.name,
        userId: session.user.id as string,
    });

    return blob.url;
}

export async function deleteAsset(assetId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const asset = await db.query.assets.findFirst({
        where: (a, { eq }) => eq(a.id, assetId),
    });

    if (!asset || asset.userId !== session.user.id) throw new Error("Unauthorized");

    await del(new URL(asset.url).pathname); // removes from Blob storage
    await db.delete(assets).where(eq(assets.id, assetId));

    return true;
}

export async function getUserAssets() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const userAssets = await db.query.assets.findMany({
        where: (a, { eq }) => eq(a.userId, session?.user?.id as string),
        orderBy: (a, { desc }) => [desc(a.createdAt)],
    })

    return userAssets
}
