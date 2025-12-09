"use client";

import type React from "react";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMap } from "@/app/actions/maps";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import MapPreview from "./MapPreview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Token {
  id: string;
  name: string;
  position: string;
  color: string;
  size: string;
  imageUrl?: string;
  shortcode?: string;
}

export default function CreateMapButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("10x10");
  const [cellSize, setCellSize] = useState(40);
  const [backgroundMode, setBackgroundMode] = useState("light");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [backgroundUrl, setBackgroundUrl] = useState("");
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
      } else {
        console.error("[v0] Error preloading token:", await response.text());
      }
    } catch (error) {
      console.error("[v0] Error preloading token image:", error);
    } finally {
      setIsPreloadingToken(null);
    }
  };

  const generateTokenString = () => {
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
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createMap(
          name,
          description,
          size,
          generateTokenString(),
          cellSize,
          backgroundMode,
          backgroundUrl
        );
        setOpen(false);
        // Reset form
        setName("");
        setDescription("");
        setSize("10x10");
        setCellSize(40);
        setBackgroundMode("light");
        setTokens([]);
        setBackgroundUrl("");
        router.refresh();
      } catch (error) {
        console.error("Error creating map:", error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Map
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Battle Map</DialogTitle>
            <DialogDescription>
              Create a new battle map using OTFBM. Preview updates in real-time.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Map Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Map Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Goblin Ambush"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A dangerous forest path with goblins hiding..."
                rows={3}
              />
            </div>

            {/* Grid Configuration */}
            <div className="grid grid-cols-3 gap-4">
              {/* Grid Size */}
              <div className="space-y-2">
                <Label htmlFor="size">Grid Size *</Label>
                <Input
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="10x10"
                  required
                />
                <p className="text-xs text-muted-foreground">WIDTHxHEIGHT</p>
              </div>

              {/* Cell Size */}
              <div className="space-y-2">
                <Label htmlFor="cellSize">Cell Size (px) *</Label>
                <Input
                  id="cellSize"
                  type="number"
                  min="20"
                  max="200"
                  value={cellSize}
                  onChange={(e) =>
                    setCellSize(Number.parseInt(e.target.value) || 40)
                  }
                  placeholder="40"
                  required
                />
                <p className="text-xs text-muted-foreground">20-200px</p>
              </div>

              {/* Background Mode */}
              <div className="space-y-2">
                <Label htmlFor="backgroundMode">Background *</Label>
                <Select
                  value={backgroundMode}
                  onValueChange={setBackgroundMode}
                >
                  <SelectTrigger id="backgroundMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Grid color</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tokens</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addToken}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Token
                </Button>
              </div>

              {tokens.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                  {`No tokens added yet. Click "Add Token" to place characters on
                  the map.`}
                </p>
              ) : (
                <div className="space-y-3">
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex gap-2 items-start p-3 border rounded-md bg-muted/20"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`token-name-${token.id}`}
                            className="text-xs"
                          >
                            Name
                          </Label>
                          <Input
                            id={`token-name-${token.id}`}
                            value={token.name}
                            onChange={(e) =>
                              updateToken(token.id, "name", e.target.value)
                            }
                            placeholder="Fighter"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`token-position-${token.id}`}
                            className="text-xs"
                          >
                            Position
                          </Label>
                          <Input
                            id={`token-position-${token.id}`}
                            value={token.position}
                            onChange={(e) =>
                              updateToken(
                                token.id,
                                "position",
                                e.target.value.toUpperCase()
                              )
                            }
                            placeholder="A1"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`token-color-${token.id}`}
                            className="text-xs"
                          >
                            Color
                          </Label>
                          <Select
                            value={token.color}
                            onValueChange={(value) =>
                              updateToken(token.id, "color", value)
                            }
                          >
                            <SelectTrigger
                              id={`token-color-${token.id}`}
                              className="h-9"
                            >
                              <SelectValue placeholder="Default" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">
                                Default (Black)
                              </SelectItem>
                              <SelectItem value="r">Red</SelectItem>
                              <SelectItem value="b">Blue</SelectItem>
                              <SelectItem value="g">Green</SelectItem>
                              <SelectItem value="y">Yellow</SelectItem>
                              <SelectItem value="p">Purple</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`token-size-${token.id}`}
                            className="text-xs"
                          >
                            Size
                          </Label>
                          <Select
                            value={token.size}
                            onValueChange={(value) =>
                              updateToken(token.id, "size", value)
                            }
                          >
                            <SelectTrigger
                              id={`token-size-${token.id}`}
                              className="h-9"
                            >
                              <SelectValue placeholder="Medium" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="huge">Huge</SelectItem>
                              <SelectItem value="gargantuan">
                                Gargantuan
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label
                            htmlFor={`token-image-${token.id}`}
                            className="text-xs"
                          >
                            Custom Image URL (optional)
                          </Label>
                          <Input
                            id={`token-image-${token.id}`}
                            value={token.imageUrl || ""}
                            onChange={(e) =>
                              updateToken(token.id, "imageUrl", e.target.value)
                            }
                            placeholder="https://example.com/token.png"
                            className="h-9"
                            type="url"
                          />
                          {token.imageUrl && !token.shortcode && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                preloadTokenImage(token.id, token.imageUrl!)
                              }
                              disabled={isPreloadingToken === token.id}
                              className="h-8 text-xs mt-1 w-full"
                            >
                              {isPreloadingToken === token.id
                                ? "Loading..."
                                : "Load Custom Image"}
                            </Button>
                          )}
                          {token.shortcode && (
                            <p className="text-xs text-green-600 mt-1">
                              Custom image loaded ✓ (code: {token.shortcode})
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeToken(token.id)}
                        className="mt-6 h-9 w-9 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Position format: Column + Row (e.g., A1, B5, C10). Grid starts
                at A1 (top-left).
              </p>
            </div>

            {/* Background URL */}
            <div className="space-y-2">
              <Label htmlFor="backgroundUrl">Background Image URL</Label>
              <Input
                id="backgroundUrl"
                value={backgroundUrl}
                onChange={(e) => setBackgroundUrl(e.target.value)}
                placeholder="https://example.com/forest-background.jpg"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add a custom background image
              </p>
            </div>

            {/* Map Preview */}
            <MapPreview
              size={size}
              tokens={generateTokenString()}
              cellSize={cellSize}
              backgroundMode={backgroundMode}
              backgroundUrl={backgroundUrl}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Map"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
