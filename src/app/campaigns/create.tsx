"use client";

import { useState } from "react";
import { useTransition } from "react";
import { createCampaign } from "@/app/actions/campaign"; // Import the server action

export default function CreateCampaignForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await createCampaign(name, description );
        // Handle success, e.g., redirect or show a message
        console.log("Campaign created:", result);
      } catch (error) {
        console.error("Error creating campaign:", error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold">Create Campaign</h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Campaign Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          rows={4}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        disabled={isPending}
      >
        {isPending ? "Creating..." : "Create Campaign"}
      </button>
    </form>
  );
}
