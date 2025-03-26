import { Suspense } from "react";
import CampaignList from "./CampaignList";
import CreateCampaignForm from "./create";
import ParticipatingCampaignList from "./ParticipatingCampaignList";

export default function CampaignsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Skeleton loader until campaigns load */}
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
