import { Suspense } from "react";
import CampaignList from "./CampaignList";
import CreateCampaignForm from "./create";

export default function CampaignsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Campaigns</h1>

      {/* Skeleton loader until campaigns load */}
      <Suspense fallback={<CampaignList.Skeleton />}>
        <CampaignList />
      </Suspense>

      <CreateCampaignForm />
    </div>
  );
}
