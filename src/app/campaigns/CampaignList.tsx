import { fetchCampaigns } from "@/app/actions/campaign";
import DeleteCampaignButton from "./DeleteCampaignButton";
import Link from "next/link";

export default async function CampaignList() {
  const campaigns = await fetchCampaigns();

  return (
    <ul className="space-y-4">
    {campaigns.map((campaign) => (
      <li key={campaign.id} className="border p-4 rounded-lg shadow flex justify-between items-center">
        <Link href={`/campaigns/${campaign.id}`} className="flex-grow">
          <h3 className="text-lg font-semibold">{campaign.name}</h3>
          <p className="text-gray-600">{campaign.description}</p>
        </Link>
        <DeleteCampaignButton id={campaign.id} />
      </li>
    ))}
  </ul>
  );
}

// 🦴 Skeleton Loader
CampaignList.Skeleton = function Skeleton() {
  return (
    <ul className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="border p-4 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </li>
      ))}
    </ul>
  );
};
