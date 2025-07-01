"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Asset, AssetGrid } from "@/components/AssetGrid";
import { UploadButton } from "@/components/upload-button";

interface AssetsPageClientProps {
  assets: Asset[];
}

export function AssetsPageClient({
  assets: initialAssets,
}: AssetsPageClientProps) {
  const [assets] = useState(initialAssets);
  const router = useRouter();

  const handleUploadComplete = () => {
    // Refresh the page to get updated assets from server
    router.refresh();
    console.log("Assets reloaded after upload");
  };

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Assets</h1>
          <p className="text-muted-foreground">
            Manage your uploaded images and files
          </p>
        </div>
        <UploadButton onUploadComplete={handleUploadComplete} />
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">
            {"You haven't uploaded any assets yet"}
          </p>
          <UploadButton onUploadComplete={handleUploadComplete} />
        </div>
      ) : (
        <AssetGrid assets={assets} />
      )}
    </div>
  );
}
