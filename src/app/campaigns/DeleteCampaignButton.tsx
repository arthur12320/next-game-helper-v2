"use client";

import { useTransition } from "react";
import { deleteCampaign } from "@/app/actions/campaign"

export default function DeleteCampaignButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => deleteCampaign(id))}
      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
