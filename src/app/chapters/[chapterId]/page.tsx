import { fetchPostsByChapter } from "@/app/actions/posts";
import AddPostForm from "@/components/AddPostForm";
import PostList from "@/components/PostList";

export default async function ChapterPage({
  params,
}: {
  params: { chapterId: string };
}) {
  const { chapterId } = await params;
  const posts = await fetchPostsByChapter(chapterId);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add a Post</h2>
      <AddPostForm chapterId={chapterId} />
      {/* Existing Post List Component Here */}
      <PostList posts={posts} />
    </div>
  );
}
