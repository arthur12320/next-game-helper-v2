import { Suspense } from "react";
import CampaignList from "./CampaignList";
import CreateCampaignForm from "./create";
import ParticipatingCampaignList from "./ParticipatingCampaignList";

export default function CampaignsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-6 space-y-8">
      {/* Skeleton loader until campaigns lad */}
      <h1 className="text-2xl font-bold mb-4">Your Campaigns</h1>
      <Suspense fallback={<CampaignList.Skeleton />}>
        <CampaignList />
      </Suspense>

      <h1 className="text-2xl font-bold mb-4">Participating Campaings</h1>
      <Suspense fallback={<ParticipatingCampaignList.Skeleton />}>
        <ParticipatingCampaignList />
      </Suspense>

      <CreateCampaignForm />
    </div>
  );
}
