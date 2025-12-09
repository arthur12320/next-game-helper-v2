"use client";
import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateMap } from "@/app/actions/maps";
import type { Map } from "@/db/schema/maps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import CopyMapUrlButton from "./CopyMapUrlButton";

interface Token {
  id: string;
  name: string;
  position: string;
  color: string;
  size: string;
  imageUrl?: string;
  shortcode?: string;
}

function parseTokenString(tokenString: string): Token[] {
  if (!tokenString.trim()) return [];

  return tokenString.split("/").map((token) => {
    const customMatch = token.match(
      /^([A-Z]\d+)([rgbyp]?)-(.+?)~([^-]+)(-[slhg])?$/
    );
    if (customMatch) {
      return {
        id: crypto.randomUUID(),
        position: customMatch[1],
        color: customMatch[2] || "default",
        name: customMatch[3],
        shortcode: customMatch[4],
        size: customMatch[5]?.substring(1) || "medium",
      };
    }

    const match = token.match(/^([A-Z]\d+)([rgbyp]?)-(.+?)(-[slhg])?$/);
    if (match) {
      return {
        id: crypto.randomUUID(),
        position: match[1],
        color: match[2] || "default",
        name: match[3],
        size: match[4]?.substring(1) || "medium",
      };
    }
    return {
      id: crypto.randomUUID(),
      position: "",
      color: "default",
      name: token,
      size: "medium",
    };
  });
}

export default function MapEditor({ map }: { map: Map }) {
  const [name, setName] = useState(map.name);
  const [description, setDescription] = useState(map.description || "");
  const [size, setSize] = useState(map.size);
  const [cellSize, setCellSize] = useState(map.cellSize || 40);
  const [backgroundMode, setBackgroundMode] = useState(
    map.backgroundMode || "light"
  );
  const [tokens, setTokens] = useState<Token[]>(parseTokenString(map.tokens));
  const [backgroundUrl, setBackgroundUrl] = useState(map.backgroundUrl || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [isPreloadingToken, setIsPreloadingToken] = useState<string | null>(
    null
  );

  const preloadTokenImage = async (tokenId: string, imageUrl: string) => {
    if (!imageUrl) return;

    setIsPreloadingToken(tokenId);
    try {
      const response = await fetch("/api/preload-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        updateToken(tokenId, "shortcode", data.shortcode);
        console.log(data);
      } else {
        console.error("[v0] Error preloading token:", await response.text());
      }
    } catch (error) {
      console.error("[v0] Error preloading token image:", error);
    } finally {
      setIsPreloadingToken(null);
    }
  };

  const generateTokenString = useCallback(() => {
    return tokens
      .filter((t) => t.name && t.position)
      .map((t) => {
        let tokenStr = `${t.position}${t.color === "default" ? "" : t.color}-${
          t.name
        }`;
        if (t.shortcode) {
          tokenStr += `~${t.shortcode}`;
        }
        if (t.size && t.size !== "medium") {
          tokenStr += `-${t.size.charAt(0)}`;
        }
        return tokenStr;
      })
      .join("/");
  }, [tokens]);

  const generateOTFBMUrl = useCallback(() => {
    let url = `https://otfbm.io/${size}`;
    if (cellSize !== 40) url += `/@c${cellSize}`;
    if (backgroundMode === "dark") url += "/@d";
    const tokenStr = generateTokenString();
    if (tokenStr) url += `/${tokenStr}`;
    if (backgroundUrl) url += `?bg=${encodeURIComponent(backgroundUrl)}`;
    return url;
  }, [size, cellSize, backgroundMode, generateTokenString, backgroundUrl]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        try {
          await updateMap(
            map.id,
            name,
            description,
            size,
            generateTokenString(),
            cellSize,
            backgroundMode,
            backgroundUrl
          );
          router.refresh();
        } catch (error) {
          console.error("[v0] Autosave error:", error);
        }
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    name,
    description,
    size,
    tokens,
    cellSize,
    backgroundMode,
    backgroundUrl,
    map.id,
    generateTokenString,
    router,
  ]);

  const addToken = () => {
    setTokens([
      ...tokens,
      {
        id: crypto.randomUUID(),
        name: "",
        position: "",
        color: "default",
        size: "medium",
      },
    ]);
  };

  const removeToken = (id: string) => {
    setTokens(tokens.filter((t) => t.id !== id));
  };

  const updateToken = (id: string, field: keyof Token, value: string) => {
    setTokens(tokens.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Link href="/maps">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-lg">{name}</h1>
            <p className="text-xs text-muted-foreground">
              {isPending ? "Saving..." : "All changes saved"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CopyMapUrlButton url={generateOTFBMUrl()} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Map Display */}
        <div className="flex-1 relative bg-muted/30 flex items-center justify-center p-4">
          <div className="w-full h-full flex items-center justify-center">
            <Image
              src={generateOTFBMUrl() || "/placeholder.svg"}
              alt={name}
              width={1200}
              height={1200}
              className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
              unoptimized
            />
          </div>
        </div>

        {/* Right Sidebar - Compact Controls */}
        <Card className="w-80 border-l rounded-none overflow-y-auto">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">
                Map Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size" className="text-xs">
                Grid Size
              </Label>
              <Input
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="10x10"
                className="h-8 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="cellSize" className="text-xs">
                  Cell Size
                </Label>
                <Input
                  id="cellSize"
                  type="number"
                  min="20"
                  max="200"
                  value={cellSize}
                  onChange={(e) =>
                    setCellSize(Number.parseInt(e.target.value) || 40)
                  }
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundMode" className="text-xs">
                  Mode
                </Label>
                <Select
                  value={backgroundMode}
                  onValueChange={setBackgroundMode}
                >
                  <SelectTrigger id="backgroundMode" className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundUrl" className="text-xs">
                Background Image
              </Label>
              <Input
                id="backgroundUrl"
                value={backgroundUrl}
                onChange={(e) => setBackgroundUrl(e.target.value)}
                type="url"
                placeholder="https://..."
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Tokens</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addToken}
                  className="h-7 text-xs bg-transparent"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex gap-1 items-start p-2 border rounded bg-card"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        value={token.name}
                        onChange={(e) =>
                          updateToken(token.id, "name", e.target.value)
                        }
                        placeholder="Name"
                        className="h-7 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-1">
                        <Input
                          value={token.position}
                          onChange={(e) =>
                            updateToken(
                              token.id,
                              "position",
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="A1"
                          className="h-7 text-xs"
                        />
                        <Select
                          value={token.color}
                          onValueChange={(value) =>
                            updateToken(token.id, "color", value)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="r">Red</SelectItem>
                            <SelectItem value="b">Blue</SelectItem>
                            <SelectItem value="g">Green</SelectItem>
                            <SelectItem value="y">Yellow</SelectItem>
                            <SelectItem value="p">Purple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Select
                        value={token.size}
                        onValueChange={(value) =>
                          updateToken(token.id, "size", value)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="huge">Huge</SelectItem>
                          <SelectItem value="gargantuan">Gargantuan</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={token.imageUrl || ""}
                        onChange={(e) =>
                          updateToken(token.id, "imageUrl", e.target.value)
                        }
                        placeholder="Image URL (optional)"
                        className="h-7 text-xs"
                        type="url"
                      />
                      {token.imageUrl && !token.shortcode && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            preloadTokenImage(token.id, token.imageUrl!)
                          }
                          disabled={isPreloadingToken === token.id}
                          className="h-7 text-xs"
                        >
                          {isPreloadingToken === token.id
                            ? "Loading..."
                            : "Load Custom Image"}
                        </Button>
                      )}
                      {token.shortcode && (
                        <p className="text-xs text-green-600">
                          Custom image loaded ✓
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeToken(token.id)}
                      className="h-7 w-7 p-0 mt-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
