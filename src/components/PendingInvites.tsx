"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getPendingInvites,
  acceptInvite,
  rejectInvite,
} from "@/app/actions/campaignInvites";
import { SelectInviteWithCampaign } from "@/db/schema/campaignInvites";

export default function PendingInvites() {
  const [invites, setInvites] = useState<SelectInviteWithCampaign[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadInvites() {
      const data = await getPendingInvites();
      setInvites(data as SelectInviteWithCampaign[]);
    }
    loadInvites();
  }, []);

  const handleAccept = (inviteId: string) => {
    startTransition(async () => {
      await acceptInvite(inviteId);
      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    });
  };

  const handleReject = (inviteId: string) => {
    startTransition(async () => {
      await rejectInvite(inviteId);
      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    });
  };

  return (
    <div>
      {invites.length === 0 ? (
        <p>No pending invites.</p>
      ) : (
        invites.map((invite) => (
          <div
            key={invite.id}
            className="flex justify-between items-center p-2 border-b"
          >
            <span>{invite.campaign.name}</span>
            <div className="space-x-2">
              {isPending ? (
                <p>sending...</p>
              ) : (
                <>
                  <button
                    onClick={() => handleAccept(invite.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(invite.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
