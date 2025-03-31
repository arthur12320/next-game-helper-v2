"use client";

import { useEffect, useState } from "react";
import { createChapter, deleteChapter, fetchChapters } from "@/app/actions/chapters";
import { useRouter } from "next/navigation";
import { Chapter } from "@/db/schema/chapters";

export default function CampaignChaptersModal({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapterName, setNewChapterName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch chapters when modal opens
  useEffect(() => {
    fetchChapters(campaignId).then(setChapters);
  }, [campaignId]);

  async function handleCreate() {
    if (!newChapterName.trim()) return;
    await createChapter({ campaignId, name: newChapterName });
    setNewChapterName("");
    setChapters(await fetchChapters(campaignId));
    router.refresh();
  }

  async function handleDelete(chapterId: string) {
    await deleteChapter({ chapterId });
    setChapters(await fetchChapters(campaignId));
    setConfirmDeleteId(null);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold">Manage Chapters</h2>

        {/* Chapter List */}
        <ul className="mt-4 space-y-2">
          {chapters.map((chapter) => (
            <li key={chapter.id} className="flex justify-between items-center border p-2 rounded">
              <span>{chapter.name}</span>
              <button
                onClick={() => setConfirmDeleteId(chapter.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-lg">
              <p>Are you sure you want to delete this chapter?</p>
              <div className="flex justify-end mt-2">
                <button onClick={() => setConfirmDeleteId(null)} className="mr-2">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Chapter */}
        <div className="mt-4 flex">
          <input
            type="text"
            value={newChapterName}
            onChange={(e) => setNewChapterName(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="New Chapter Name"
          />
          <button onClick={handleCreate} className="bg-blue-600 text-white px-3 py-2 rounded ml-2">
            Add
          </button>
        </div>

        <button onClick={onClose} className="mt-4 w-full bg-gray-300 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
}
