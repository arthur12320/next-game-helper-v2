"use client";

import { startTransition, useState } from "react";

import { deletePost, editPost } from "@/app/actions/posts";
import StyledMarkdown from "@/components/StyledMarkdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PostWithAuthorName } from "@/db/schema/posts";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PostList({ posts }: { posts: PostWithAuthorName[] }) {
  const [editingPost, setEditingPost] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const router = useRouter();

  const handleEditPost = (post: PostWithAuthorName) => {
    if (editingPost && editingPost.id === post.id) {
      startTransition(async () => {
        const result = await editPost(post.id, editingPost.content);
        if (result.success) {
          setEditingPost(null);
          router.refresh(); // Refresh the page to reflect changes
        } else {
          console.error(result.error);
        }
      });
    } else {
      setEditingPost({ id: post.id, content: post.content });
    }
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    router.refresh(); // Refresh the page to reflect changes
  };

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
              {editingPost && editingPost.id === post.id ? (
                <Textarea
                  value={JSON.parse(editingPost.content).markdown}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      content: JSON.stringify({
                        ...JSON.parse(editingPost.content),
                        markdown: e.target.value,
                      }),
                    })
                  }
                  className="mb-2"
                  rows={6}
                />
              ) : (
                <StyledMarkdown content={content.markdown} />
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditPost(post)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                {editingPost && editingPost.id === post.id ? "Save" : "Edit"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeletePost(post.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
