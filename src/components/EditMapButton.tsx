"use client";

import type React from "react";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMap } from "@/app/actions/maps";
import type { Map } from "@/db/schema/maps";
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
import { Edit2, Plus, X } from "lucide-react";
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
}

function parseTokenString(tokenString: string): Token[] {
  if (!tokenString.trim()) return [];

  return tokenString.split("/").map((token) => {
    // Format: A1r-Fighter or A1-Fighter
    const match = token.match(/^([A-Z]\d+)([rgbyp]?)-(.+)$/);
    if (match) {
      return {
        id: crypto.randomUUID(),
        position: match[1],
        color: match[2] || "",
        name: match[3],
      };
    }
    return { id: crypto.randomUUID(), position: "", color: "", name: token };
  });
}

export default function EditMapButton({ map }: { map: Map }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(map.name);
  const [description, setDescription] = useState(map.description || "");
  const [size, setSize] = useState(map.size);
  const [tokens, setTokens] = useState<Token[]>(parseTokenString(map.tokens));
  const [backgroundUrl, setBackgroundUrl] = useState(map.backgroundUrl || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const generateTokenString = () => {
    return tokens
      .filter((t) => t.name && t.position)
      .map((t) => `${t.position}${t.color}-${t.name}`)
      .join("/");
  };

  const addToken = () => {
    setTokens([
      ...tokens,
      { id: crypto.randomUUID(), name: "", position: "", color: "default" },
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
        await updateMap(
          map.id,
          name,
          description,
          size,
          generateTokenString(),
          backgroundUrl
        );
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error updating map:", error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Battle Map</DialogTitle>
            <DialogDescription>
              Update your battle map settings and preview changes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Map Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-size">Grid Size *</Label>
              <Input
                id="edit-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: WIDTHxHEIGHT (e.g., 10x10, 20x15)
              </p>
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
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`edit-token-name-${token.id}`}
                            className="text-xs"
                          >
                            Name
                          </Label>
                          <Input
                            id={`edit-token-name-${token.id}`}
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
                            htmlFor={`edit-token-position-${token.id}`}
                            className="text-xs"
                          >
                            Position
                          </Label>
                          <Input
                            id={`edit-token-position-${token.id}`}
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
                            htmlFor={`edit-token-color-${token.id}`}
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
                              id={`edit-token-color-${token.id}`}
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

            <div className="space-y-2">
              <Label htmlFor="edit-backgroundUrl">Background Image URL</Label>
              <Input
                id="edit-backgroundUrl"
                value={backgroundUrl}
                onChange={(e) => setBackgroundUrl(e.target.value)}
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add a custom background image
              </p>
            </div>

            <MapPreview
              size={size}
              tokens={generateTokenString()}
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
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
