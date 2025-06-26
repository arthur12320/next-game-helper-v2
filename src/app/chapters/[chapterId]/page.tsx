import { fetchChapter } from "@/app/actions/chapters";
import PostList from "@/app/chapters/[chapterId]/PostList";
import AddPostForm from "@/components/AddPostForm";
import { Chapter } from "@/db/schema/chapters";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = (await fetchChapter(chapterId)) as Chapter;
  if (!chapter) return redirect("/");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl py-6 space-y-8 ">
      <Link
        href={`/campaigns/${chapter.campaignId}`}
        className="inline-block mt-4 text-blue-500"
      >
        ← Back to Chapters
      </Link>
      <div>
        <h1 className="text-2xl font-bold mt-4">{chapter.name} - Chapters</h1>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">Add a Post</h2>
        <AddPostForm chapterId={chapterId} />
      </div>
      <div className="pt-2">
        {/* Existing Post List Component Here */}
        <Suspense fallback={<PostList.skeleton />}>
          <PostList chapterId={chapterId} />
        </Suspense>
      </div>
    </div>
  );
}
