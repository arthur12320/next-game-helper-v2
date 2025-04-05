import { fetchCampaign } from "@/app/actions/campaign";
import { Campaign } from "@/db/schema/campaigns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AddChapterForm from "./AddChapterForm";
import ChapterList from "./ChapterList";

export default async function CampaignChapters({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const campaign = (await fetchCampaign(campaignId)) as Campaign;
  if (!campaign) return redirect("/");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-6 space-y-8">
      {/* Back button */}
      <Link href="/campaigns" className="inline-block  text-blue-500">
        ← Back to Campaigns
      </Link>
      <div>
        <h1 className="text-2xl font-bold ">{campaign.name} - Chapters</h1>
        <p className="text-gray-600">{campaign.description}</p>
      </div>
      {/* Add Chapter Form */}
      <AddChapterForm campaignId={campaignId} />

      {/* Chapters List */}
      <Suspense fallback={<ChapterList.skeleton />}>
        <ChapterList campaignId={campaignId} />
      </Suspense>
    </div>
  );
}
