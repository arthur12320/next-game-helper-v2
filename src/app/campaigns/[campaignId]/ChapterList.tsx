import { fetchChapters } from "@/app/actions/chapters";
import DeleteChapterButton from "./DeleteChapterbutton";
import Link from "next/link";

export default async function ChapterList({ campaignId }: { campaignId: string }) {
  const chapters = await fetchChapters(campaignId);

  return (
    <ul className="space-y-4">
      {chapters.map((chapter) => (
        <li key={chapter.id} className="border p-4 rounded-lg shadow flex justify-between items-center">
          <Link href={`/chapters/${chapter.id}`} className="text-lg font-semibold hover:underline">
            {chapter.name}
          </Link>
          <DeleteChapterButton chapterId={chapter.id} />
        </li>
      ))}
    </ul>
  );
}


ChapterList.skeleton = function skeleton() {
    return (
        <ul className="mt-4 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex justify-between items-center border p-2 rounded animate-pulse">
            <span className="bg-gray-300 h-4 w-32 rounded"></span>
            <span className="bg-gray-300 h-4 w-16 rounded"></span>
            </li>
        ))}
        </ul>
    );
}