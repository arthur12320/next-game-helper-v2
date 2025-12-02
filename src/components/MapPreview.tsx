"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MapPreviewProps {
  size: string;
  tokens: string;
  backgroundUrl?: string;
}

export default function MapPreview({
  size,
  tokens,
  backgroundUrl,
}: MapPreviewProps) {
  const previewUrl = useMemo(() => {
    if (!size.trim()) return null;

    let url = `https://otfbm.io/${encodeURIComponent(size)}`;

    if (tokens.trim()) {
      url += `/${encodeURIComponent(tokens)}`;
    }

    if (backgroundUrl?.trim()) {
      url += `?bg=${encodeURIComponent(backgroundUrl)}`;
    }

    return url;
  }, [size, tokens, backgroundUrl]);

  if (!previewUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Enter a grid size to see preview
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden">
          <Image
            src={previewUrl || "/placeholder.svg"}
            alt="Map Preview"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="mt-3 p-2 bg-muted rounded text-xs font-mono break-all">
          {previewUrl}
        </div>
      </CardContent>
    </Card>
  );
}
