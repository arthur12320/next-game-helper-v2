"use client";

import { useState, useTransition } from "react";
import { addPost } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AddPostForm({ chapterId }: { chapterId: string;}) {
  const [markdown, setMarkdown] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await addPost({ chapterId, markdown });
      setMarkdown(""); // Clear form after submission
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Write your post..."
        rows={4}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Posting..." : "Add Post"}
      </Button>
    </form>
  );
}
