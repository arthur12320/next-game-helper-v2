"use client";

import { useTransition } from "react";
import { abandonCampaign } from "../actions/campaignPlayers";

export default function LeaveCampaignButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => abandonCampaign(id))}
      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      disabled={isPending}
    >
      {isPending ? "Leaving..." : "Leave"}
    </button>
  );
}
