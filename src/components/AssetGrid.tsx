"use client";

import { deleteAsset } from "@/app/actions/assets";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Check, Copy, ExternalLink, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export interface Asset {
  id: string;
  url: string;
  name: string;
  userId: string;
  createdAt?: Date;
}

interface AssetGridProps {
  assets: Asset[];
}

export function AssetGrid({ assets }: AssetGridProps) {
  const [assetStates, setAssetStates] = useState<
    Record<string, { copied: boolean; deleting: boolean }>
  >({});
  const [deletingAssets, setDeletingAssets] = useState<string[]>([]);

  function getAssetState(id: string) {
    return assetStates[id] || { copied: false, deleting: false };
  }

  async function handleCopyUrl(url: string, id: string) {
    await navigator.clipboard.writeText(url);

    setAssetStates((prev) => ({
      ...prev,
      [id]: { ...getAssetState(id), copied: true },
    }));

    setTimeout(() => {
      setAssetStates((prev) => ({
        ...prev,
        [id]: { ...getAssetState(id), copied: false },
      }));
    }, 2000);
  }

  async function handleDeleteAsset(id: string) {
    try {
      setDeletingAssets((prev) => [...prev, id]);
      await deleteAsset(id);
      toast("Asset deleted", {
        description: "The asset has been successfully deleted.",
      });
      // Remove the asset from the UI without a full page refresh
      const assetElement = document.getElementById(`asset-${id}`);
      if (assetElement) {
        assetElement.style.opacity = "0";
        setTimeout(() => {
          assetElement.style.display = "none";
        }, 300);
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete the asset. Please try again.",
      });
      console.error(error);
    } finally {
      setDeletingAssets((prev) => prev.filter((assetId) => assetId !== id));
    }
  }

  function isImageFile(filename: string) {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
    ];
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    return imageExtensions.includes(ext);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <Card
          key={asset.id}
          id={`asset-${asset.id}`}
          className="overflow-hidden transition-opacity duration-300"
        >
          <CardContent className="p-0">
            <div className="relative aspect-square bg-muted/50 flex items-center justify-center">
              {isImageFile(asset.name) ? (
                <Image
                  src={asset.url || "/placeholder.svg"}
                  alt={asset.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-3 flex flex-col gap-2">
            <p
              className="text-sm font-medium truncate w-full"
              title={asset.name}
            >
              {asset.name}
            </p>
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleCopyUrl(asset.url, asset.id)}
              >
                {getAssetState(asset.id).copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </Button>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.open(asset.url, "_blank")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this asset? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteAsset(asset.id)}
                        disabled={deletingAssets.includes(asset.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {deletingAssets.includes(asset.id)
                          ? "Deleting..."
                          : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
