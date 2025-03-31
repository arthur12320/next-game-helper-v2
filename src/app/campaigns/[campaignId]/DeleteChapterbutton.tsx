"use client";

import { useState, useTransition } from "react";
import { deleteChapter } from "@/app/actions/chapters";

export default function DeleteChapterButton({ chapterId }: { chapterId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteChapter({chapterId});
      setIsOpen(false);
    });
  }

  return (
    <div className="relative">
      {/* Delete Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:text-red-700"
      >
        🗑 Delete
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Are you sure?</p>
            <p className="text-gray-600">This action cannot be undone.</p>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
