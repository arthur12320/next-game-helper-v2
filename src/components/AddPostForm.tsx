"use client";

import type React from "react";

import { addPost } from "@/app/actions/posts";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";

export default function AddPostForm({ chapterId }: { chapterId: string }) {
  const [markdown, setMarkdown] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await addPost({ chapterId, markdown });
      setMarkdown(""); // Clear form after submission
    });
  }

  function handleImageInsert(imageMarkdown: string) {
    // Insert markdown image syntax at cursor position or at the end
    console.log("wrong one");
    setMarkdown(
      (prev) =>
        prev +
        (prev.endsWith("\n") || prev === "" ? "" : "\n") +
        imageMarkdown +
        "\n"
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Write your post..."
        rows={4}
      />
      <div className="flex justify-between">
        <div className="flex gap-2">
          <ImageUploader onImageInsert={handleImageInsert} />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Posting..." : "Add Post"}
        </Button>
      </div>
    </form>
  );
}
