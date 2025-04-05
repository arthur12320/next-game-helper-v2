"use server";

import db from "@/db";
import { chapters, posts } from "@/db/schema";
import { PostWithAuthorName } from "@/db/schema/posts";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import { userHasAccessToCampaign } from "./campaignPermissions";


export async function fetchPostsByChapter(chapterId: string) {
  const campaignId = await db.query.chapters.findFirst({ where: eq(chapters.id, chapterId) }).then((res) => res?.campaignId);
  if (!campaignId || !(await userHasAccessToCampaign(campaignId))) return [];
  return await db.query.posts.findMany({ where: eq(posts.chapterId, chapterId), with: { author: { columns: { id: true, name: true } } }, orderBy: (posts, { desc }) => [desc(posts.createdAt)] }) as PostWithAuthorName[];
}

export async function deletePost(postId: string) {
  await db.delete(posts).where(eq(posts.id, postId));
}

export async function editPost(postId: string, updatedContent: string) {

  // Fetch campaignId via post relation -> chapter
  const post = await db.query.posts.findFirst({
    where: (post, { eq }) => eq(post.id, postId),
    with: {
      chapter: {
        columns: { campaignId: true },
      },
    },
  });

  if (!post) throw new Error("Post not found");

  // Permission check
  if (!(await userHasAccessToCampaign(post.chapter.campaignId))) {
    throw new Error("Unauthorized");
  }
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

  // Fetch campaignId via chapter relation
  const chapter = await db.query.chapters.findFirst({
    where: (chapter, { eq }) => eq(chapter.id, chapterId),
    columns: { campaignId: true },
  });

  if (!chapter) throw new Error("Chapter not found");

  // Permission check
  if (!(await userHasAccessToCampaign(chapter.campaignId))) {
    throw new Error("Unauthorized");
  }

  const content = JSON.stringify({ markdown, diceRolls });

  await db.insert(posts).values({
    chapterId,
    authorId: session.user.id as string,
    content,
  });

  revalidatePath(`/chapters/${chapterId}`);
}
