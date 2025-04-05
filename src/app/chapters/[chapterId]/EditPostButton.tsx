"use client";

import { editPost } from "@/app/actions/posts";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { PostWithAuthorName } from "@/db/schema/posts";
import { Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function EditPostButton({ post }: { post: PostWithAuthorName }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string>(() => {
    const parsedContent =
      typeof post.content === "string"
        ? JSON.parse(post.content)
        : post.content;
    return parsedContent.markdown;
  });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleImageInsert2(imageMarkdown: string) {
    // Insert markdown image syntax at cursor position or at the end
    console.log("herereeee");
    setContent(
      (prev) =>
        prev +
        (prev.endsWith("\n") || prev === "" ? "" : "\n") +
        imageMarkdown +
        "\n"
    );
  }

  const handleSave = () => {
    startTransition(async () => {
      // Create the updated content object
      const updatedContent = JSON.stringify({
        ...(typeof post.content === "string"
          ? JSON.parse(post.content)
          : post.content),
        markdown: content,
      });

      const result = await editPost(post.id, updatedContent);
      if (result.success) {
        setOpen(false);
        router.refresh(); // Refresh the page to reflect changes
      } else {
        console.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Make changes to your post content below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
            placeholder="Edit your post content..."
          />
        </div>
        <DialogFooter>
          <ImageUploader onImageInsert={handleImageInsert2} />

          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
