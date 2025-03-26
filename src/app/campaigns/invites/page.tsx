import InviteForm from "@/components/InviteForm";
import PendingInvites from "@/components/PendingInvites";
import { fetchCampaigns } from "@/app/actions/campaign";

export default async function CampaignInvitesPage() {
  // Fetch campaigns where the user is the DM (assuming getUserCampaigns fetches user's owned campaigns)
  const campaigns = await fetchCampaigns();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Campaign Invites</h1>

      {campaigns.length === 0 ? (
        <p>You are not managing any campaigns.</p>
      ) : (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Send Invites</h2>
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="mb-4 p-4 border rounded">
              <h3 className="font-semibold">{campaign.name}</h3>
              <InviteForm campaignId={campaign.id} />
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Your Pending Invites</h2>
        <PendingInvites />
      </div>
    </div>
  );
}
