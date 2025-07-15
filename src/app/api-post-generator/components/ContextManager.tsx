"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Eye, EyeOff, Plus, Minus, BookOpen } from "lucide-react";

interface AdventureJournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  tags: string[];
  inContext?: boolean;
}

interface ContextManagerProps {
  adventureJournal: AdventureJournalEntry[];
  selectedEntries: string[];
  onSelectionChange: (entries: string[]) => void;
  useContext: boolean;
  onContextToggle: (use: boolean) => void;
}

export default function ContextManager({
  adventureJournal,
  selectedEntries,
  onSelectionChange,
  useContext,
  onContextToggle,
}: ContextManagerProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [customContext, setCustomContext] = useState("");

  const toggleEntry = (entryId: string) => {
    if (selectedEntries.includes(entryId)) {
      onSelectionChange(selectedEntries.filter((id) => id !== entryId));
    } else {
      onSelectionChange([...selectedEntries, entryId]);
    }
  };

  const selectAll = () => {
    onSelectionChange(adventureJournal.map((entry) => entry.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const getContextPreview = () => {
    const contextEntries = adventureJournal
      .filter(
        (entry) =>
          selectedEntries.length === 0 || selectedEntries.includes(entry.id)
      )
      .slice(0, 5)
      .map((entry) => `${entry.title}: ${entry.content}`)
      .join("\n\n");

    return customContext
      ? `${contextEntries}\n\n${customContext}`
      : contextEntries;
  };

  const contextLength = getContextPreview().length;
  const estimatedTokens = Math.ceil(contextLength / 4); // Rough token estimation

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Context Manager
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={useContext ? "default" : "secondary"}>
              {useContext ? "Active" : "Disabled"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContextToggle(!useContext)}
            >
              {useContext ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {useContext && (
        <CardContent className="space-y-4">
          {/* Context Stats */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {selectedEntries.length || adventureJournal.slice(0, 5).length}{" "}
              entries selected
            </span>
            <span className="text-gray-600">~{estimatedTokens} tokens</span>
          </div>

          {/* Entry Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">Adventure Journal Entries</h4>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  <Plus className="w-3 h-3 mr-1" />
                  All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Minus className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-2">
              {adventureJournal.length > 0 ? (
                adventureJournal.map((entry) => (
                  <label
                    key={entry.id}
                    className={`flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                      selectedEntries.includes(entry.id)
                        ? "bg-blue-50 border border-blue-200"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => toggleEntry(entry.id)}
                      className="mt-1 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {entry.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {entry.content.substring(0, 60)}...
                      </div>
                      <div className="flex gap-1 mt-1">
                        {entry.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-1 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No journal entries yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Custom Context */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Additional Context</h4>
            <Textarea
              placeholder="Add custom context, character details, or specific instructions..."
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Context Preview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">Context Preview</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </Button>
            </div>

            {showPreview && (
              <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap text-gray-700">
                  {getContextPreview() || "No context selected"}
                </pre>
              </div>
            )}
          </div>

          {/* Context Warning */}
          {estimatedTokens > 1000 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2">
              <p className="text-xs text-amber-700">
                ⚠️ Large context may affect response quality and increase costs.
                Consider reducing selected entries.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
