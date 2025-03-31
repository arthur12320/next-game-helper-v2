import { fetchCampaign } from "@/app/actions/campaign";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddChapterForm from "./AddChapterForm";
import ChapterList from "./ChapterList";
import { Suspense } from "react";

export default async function CampaignChapters({ params }: { params: { campaignId: string } }) {
  const {campaignId} = await params;
  const campaign = await fetchCampaign(campaignId);
  if (!campaign) return redirect("/");

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{campaign.name} - Chapters</h1>
      <p className="text-gray-600">{campaign.description}</p>

      {/* Back button */}
      <Link href="/" className="inline-block mt-4 text-blue-500">
        ← Back to Campaigns
      </Link>

      {/* Add Chapter Form */}
      <AddChapterForm campaignId={campaignId} />

      {/* Chapters List */}
      <Suspense fallback={<ChapterList.skeleton />}>
        <ChapterList campaignId={campaignId} />
      </Suspense>
    </div>
  );
}

