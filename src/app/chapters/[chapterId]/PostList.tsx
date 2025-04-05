import { fetchPostsByChapter } from "@/app/actions/posts";
import StyledMarkdown from "@/components/StyledMarkdown";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DeletePostButton from "./deletePostButton";
import EditPostButton from "./EditPostButton";

export default async function PostList({ chapterId }: { chapterId: string }) {
  // Fetch posts server-side
  const posts = await fetchPostsByChapter(chapterId);

  return (
    <div className="grid gap-4">
      {posts.map((post) => {
        const content =
          typeof post.content === "string"
            ? JSON.parse(post.content)
            : post.content;
        return (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>Posted by: {post.author.name || "Unknown"}</CardTitle>
              <p className="text-sm text-gray-500">
                Posted on: {new Date(post.createdAt).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <StyledMarkdown content={content.markdown} />
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <EditPostButton post={post} />
              <DeletePostButton postId={post.id} />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

PostList.skeleton = function skeleton() {
  return (
    <div className="grid gap-4">
      {[...Array(3)].map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-32" />
            </CardTitle>
            <div className="text-sm text-gray-500">
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
