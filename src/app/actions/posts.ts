"use server";

import db from "@/db";
import { posts } from "@/db/schema";
import { PostWithAuthorName } from "@/db/schema/posts";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";


export async function fetchPostsByChapter(chapterId: string) {
  return await db.query.posts.findMany({ where: eq(posts.chapterId, chapterId), with: { author: { columns: { id: true, name: true } } } }) as PostWithAuthorName[];
}

export async function deletePost(postId: string) {
  await db.delete(posts).where(eq(posts.id, postId));
}

export async function editPost(postId: string, updatedContent: string) {
  try {
    await db
      .update(posts)
      .set({ content: updatedContent })
      .where(eq(posts.id, postId));

    revalidatePath(`/chapters/[chapterId]`, "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to update post:", error);
    return { success: false, error: "Failed to update post" };
  }
}

export async function addPost({
  chapterId,
  markdown,
  diceRolls,
}: {
  chapterId: string;
  markdown: string;
  diceRolls?: { reason: string; roll: string; details: string; result: number }[];
}) {
  const session = await auth();
  if (!session?.user) throw new Error("User not authenticated");

  const content = JSON.stringify({ markdown, diceRolls });

  await db.insert(posts).values({
    chapterId,
    authorId: session.user.id as string,
    content,
  });

  revalidatePath(`/chapters/${chapterId}`);
}
