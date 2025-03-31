"use client";

import { useState, useTransition } from "react";
import { createChapter } from "@/app/actions/chapters";
import { useRouter } from "next/navigation";

export default function AddChapterForm({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      await createChapter({ campaignId, name });
      setName(""); // Clear input
      router.refresh(); // Refresh without full reload
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        type="text"
        placeholder="New Chapter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="border p-2 rounded flex-grow"
      />
      <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-4 py-2 rounded">
        {isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
