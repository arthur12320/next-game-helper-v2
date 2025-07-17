"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  BookOpen,
  AlertTriangle,
  Brain,
  EyeOff,
  Plus,
  Minus,
  Trash2,
  FileText,
  Eye,
} from "lucide-react";
import { mergeJournalEntries, summarizeJournalEntry } from "./AIIntegration";
import {
  createJournalEntry,
  deleteJournalEntry,
  updateJournalEntry,
} from "@/app/actions/adventure-journal";
import type { SelectAdventureJournal } from "@/db/schema/adventure-journal";
import type { PromptTemplates as PromptTemplatesType } from "./PromptTemplate";

interface AdventureJournalTabProps {
  adventureJournal: SelectAdventureJournal[];
  isLoadingJournal: boolean;
  useJournalContext: boolean;
  selectedJournalEntries: string[];
  customContext: string;
  apiKey: string;
  promptTemplates: PromptTemplatesType;
  onLoadJournalEntries: () => Promise<void>;
  onToggleJournalContext: () => void;
  onToggleJournalEntry: (entryId: string) => void;
  onSelectAllEntries: () => void;
  onClearAllEntries: () => void;
  onCustomContextChange: (context: string) => void;
}

export default function AdventureJournalTab({
  adventureJournal,
  isLoadingJournal,
  useJournalContext,
  selectedJournalEntries,
  customContext,
  apiKey,
  promptTemplates,
  onLoadJournalEntries,
  onToggleJournalContext,
  onToggleJournalEntry,
  onSelectAllEntries,
  onClearAllEntries,
  onCustomContextChange,
}: AdventureJournalTabProps) {
  const [showContextPreview, setShowContextPreview] = useState(false);

  // Merge functionality state
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState("");
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeTitle, setMergeTitle] = useState("");

  // Summarize functionality state
  const [summarizingEntries, setSummarizingEntries] = useState<Set<string>>(
    new Set()
  );
  const [summaryResult, setSummaryResult] = useState("");
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [summaryEntryId, setSummaryEntryId] = useState("");

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) {
      return;
    }

    try {
      await deleteJournalEntry(entryId);
      await onLoadJournalEntries();

      // Remove from selected entries if it was selected
      if (selectedJournalEntries.includes(entryId)) {
        onToggleJournalEntry(entryId);
      }
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      alert("Failed to delete journal entry. Please try again.");
    }
  };

  const getContextPreview = useCallback(() => {
    const contextEntries = adventureJournal
      .filter((entry) => selectedJournalEntries.includes(entry.id))
      .slice(0, 5)
      .map((entry) => `${entry.title}: ${entry.content}`)
      .join("\n\n");

    return customContext
      ? `${contextEntries}\n\n${customContext}`
      : contextEntries;
  }, [adventureJournal, selectedJournalEntries, customContext]);

  const contextLength = getContextPreview().length;
  const estimatedTokens = Math.ceil(contextLength / 4); // Rough token estimation

  const mergeSelectedEntries = async () => {
    if (selectedJournalEntries.length < 2) {
      alert("Please select at least 2 entries to merge");
      return;
    }

    if (!apiKey.trim()) {
      alert("Please configure your OpenAI API key first");
      return;
    }

    setIsMerging(true);
    setMergeResult("");

    try {
      const selectedEntries = adventureJournal.filter((entry) =>
        selectedJournalEntries.includes(entry.id)
      );

      const mergedContent = await mergeJournalEntries(
        selectedEntries,
        apiKey,
        promptTemplates
      );

      setMergeResult(mergedContent);
      setMergeTitle(`Merged Entry - ${new Date().toLocaleDateString()}`);
      setShowMergeDialog(true);
    } catch (error) {
      console.error("Error merging entries:", error);
      alert(
        `Failed to merge entries: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsMerging(false);
    }
  };

  const confirmMerge = async () => {
    if (!mergeTitle.trim() || !mergeResult.trim()) {
      alert("Please provide a title for the merged entry");
      return;
    }

    try {
      // Create the new merged entry
      await createJournalEntry({
        title: mergeTitle,
        content: mergeResult,
        tags: ["merged"], // Add a tag to identify merged entries
      });

      // Delete the selected entries
      for (const entryId of selectedJournalEntries) {
        await deleteJournalEntry(entryId);
      }

      // Reload journal entries
      await onLoadJournalEntries();

      // Reset states
      onClearAllEntries();
      setShowMergeDialog(false);
      setMergeResult("");
      setMergeTitle("");

      alert("Entries merged successfully!");
    } catch (error) {
      console.error("Error confirming merge:", error);
      alert("Failed to complete merge operation");
    }
  };

  const summarizeEntry = async (entry: SelectAdventureJournal) => {
    if (!apiKey.trim()) {
      alert("Please configure your OpenAI API key first");
      return;
    }

    setSummarizingEntries((prev) => new Set(prev).add(entry.id));

    try {
      const summary = await summarizeJournalEntry(
        entry,
        apiKey,
        promptTemplates
      );
      setSummaryResult(summary);
      setSummaryEntryId(entry.id);
      setShowSummaryDialog(true);
    } catch (error) {
      console.error("Error summarizing entry:", error);
      alert(
        `Failed to summarize entry: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSummarizingEntries((prev) => {
        const newSet = new Set(prev);
        newSet.delete(entry.id);
        return newSet;
      });
    }
  };

  const confirmSummary = async () => {
    if (!summaryResult.trim() || !summaryEntryId) {
      alert("Summary is empty or entry ID is missing");
      return;
    }

    try {
      const originalEntry = adventureJournal.find(
        (entry) => entry.id === summaryEntryId
      );
      if (!originalEntry) {
        throw new Error("Original entry not found");
      }

      await updateJournalEntry(summaryEntryId, {
        content: summaryResult,
        tags: [...(originalEntry.tags || []), "summarized"],
      });

      // Reload journal entries
      await onLoadJournalEntries();

      // Reset states
      setShowSummaryDialog(false);
      setSummaryResult("");
      setSummaryEntryId("");

      alert("Entry summarized successfully!");
    } catch (error) {
      console.error("Error confirming summary:", error);
      alert("Failed to update entry with summary");
    }
  };

  return (
    <div className="space-y-6">
      {/* Context Manager Section */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              AI Context Manager
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={useJournalContext ? "default" : "secondary"}>
                {useJournalContext ? "Active" : "Disabled"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleJournalContext}
              >
                {useJournalContext ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {useJournalContext && (
          <CardContent className="space-y-4">
            {/* Context Stats */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {selectedJournalEntries.length ||
                  adventureJournal.slice(0, 5).length}{" "}
                entries selected
              </span>
              <span className="text-gray-600">~{estimatedTokens} tokens</span>
            </div>

            {/* Selection Controls */}
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">
                Select entries for AI context
              </h4>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectAllEntries}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  All
                </Button>
                <Button variant="outline" size="sm" onClick={onClearAllEntries}>
                  <Minus className="w-3 h-3 mr-1" />
                  Clear
                </Button>
                {selectedJournalEntries.length >= 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={mergeSelectedEntries}
                    disabled={isMerging}
                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    {isMerging ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Merging...
                      </>
                    ) : (
                      <>
                        <Brain className="w-3 h-3 mr-1" />
                        Merge ({selectedJournalEntries.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Custom Context */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Additional Context</h4>
              <Textarea
                placeholder="Add custom context, character details, or specific instructions..."
                value={customContext}
                onChange={(e) => onCustomContextChange(e.target.value)}
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
                  onClick={() => setShowContextPreview(!showContextPreview)}
                >
                  {showContextPreview ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {showContextPreview && (
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
                  ⚠️ Large context may affect response quality and increase
                  costs. Consider reducing selected entries.
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Journal Entries */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Adventure Journal Entries</h2>
        <div className="flex items-center gap-2">
          {isLoadingJournal && <RefreshCw className="w-4 h-4 animate-spin" />}
          <Badge variant="secondary">{adventureJournal.length} entries</Badge>
          <Button variant="outline" size="sm" onClick={onLoadJournalEntries}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoadingJournal ? (
        <div className="text-center py-12 text-gray-500">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>Loading journal entries...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {adventureJournal.map((entry) => (
            <Card
              key={entry.id}
              className={
                selectedJournalEntries.includes(entry.id)
                  ? "ring-2 ring-blue-200"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {useJournalContext && (
                      <label className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          checked={selectedJournalEntries.includes(entry.id)}
                          onChange={() => onToggleJournalEntry(entry.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleString()}
                        {entry.updatedAt !== entry.createdAt && " (edited)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {entry?.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {selectedJournalEntries.includes(entry.id) && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          In Context
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => summarizeEntry(entry)}
                      disabled={summarizingEntries.has(entry.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      {summarizingEntries.has(entry.id) ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">
                  {entry.content}
                </p>
              </CardContent>
            </Card>
          ))}

          {adventureJournal.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No journal entries yet</p>
              <p className="text-sm">
                Generate AI content and save it to start building your adventure
                journal
              </p>
            </div>
          )}
        </div>
      )}

      {/* Merge Dialog */}
      {showMergeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Merge Preview
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMergeDialog(false)}
                >
                  Cancel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto max-h-[60vh]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title for Merged Entry
                </label>
                <Input
                  value={mergeTitle}
                  onChange={(e) => setMergeTitle(e.target.value)}
                  placeholder="Enter title for the merged entry..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merged Content
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-gray-800">
                    {mergeResult}
                  </div>
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This will replace the {selectedJournalEntries.length} selected
                  entries with this single merged entry. This action cannot be
                  undone.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMergeDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmMerge}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Confirm Merge
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Dialog */}
      {showSummaryDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Summary Preview
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSummaryDialog(false)}
                >
                  Cancel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summarized Content ({summaryResult.length}/150 characters)
                </label>
                <Textarea
                  value={summaryResult}
                  onChange={(e) =>
                    setSummaryResult(e.target.value.substring(0, 150))
                  }
                  rows={3}
                  className="resize-none"
                  placeholder="AI-generated summary will appear here..."
                />
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This will replace the original entry content with this
                  summary. The original content will be lost. This action cannot
                  be undone.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSummaryDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSummary}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Confirm Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
