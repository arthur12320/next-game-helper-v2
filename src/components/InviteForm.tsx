"use client";

import { useState, useTransition } from "react";
import { sendInvite } from "@/app/actions/campaignInvites";

interface InviteFormProps {
  campaignId: string;
}

export default function InviteForm({ campaignId }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await sendInvite({ campaignId, userEmail: email }); // Replace with actual user ID
        setEmail("");
      } catch (error) {
        console.error("Error sending invite:", error);
      }
    });
  };

  return (
    <form onSubmit={handleInvite} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter user email"
        className="p-2 border rounded w-full"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isPending ? "Sending..." : "Send Invite"}
      </button>
    </form>
  );
}
