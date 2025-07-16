"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  Sparkles,
  BookOpen,
  Save,
  Copy,
  RefreshCw,
  Scroll,
  Wand2,
  Eye,
  Edit,
  AlertTriangle,
  Brain,
  EyeOff,
  Plus,
  Minus,
  Trash2,
  FileText,
} from "lucide-react";
import {
  generateMouseGuardContent,
  checkContextLimits,
  mergeJournalEntries,
  summarizeJournalEntry,
} from "./components/AIIntegration";
import APIKeyManager from "./components/APIKeyManager";
import BlogIntegration from "./components/BlogIntegration";
import {
  createJournalEntry,
  fetchJournalEntries,
  deleteJournalEntry,
  updateJournalEntry,
} from "@/app/actions/adventure-journal";
import type { SelectAdventureJournal } from "@/db/schema/adventure-journal";

interface GeneratedPost {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
  postType: string;
  tone: string;
  length: string;
  saved: boolean;
  usedContext?: boolean;
  contextEntries?: number;
}

const POST_TYPES = [
  {
    value: "narrative",
    label: "Narrative Scene",
    description: "Descriptive storytelling and scene setting",
  },
  {
    value: "dialogue",
    label: "Character Dialogue",
    description: "Conversations and character interactions",
  },
  {
    value: "action",
    label: "Action Sequence",
    description: "Combat, chases, and dynamic scenes",
  },
  {
    value: "description",
    label: "Environmental Description",
    description: "Locations, atmosphere, and world-building",
  },
  {
    value: "npc",
    label: "NPC Interaction",
    description: "Non-player character responses and behavior",
  },
  {
    value: "plot",
    label: "Plot Development",
    description: "Story progression and narrative hooks",
  },
  {
    value: "mystery",
    label: "Mystery/Investigation",
    description: "Clues, puzzles, and investigative elements",
  },
  {
    value: "social",
    label: "Social Encounter",
    description: "Negotiations, politics, and social dynamics",
  },
];

const TONE_OPTIONS = [
  { value: "dramatic", label: "Dramatic" },
  { value: "humorous", label: "Humorous" },
  { value: "mysterious", label: "Mysterious" },
  { value: "heroic", label: "Heroic" },
  { value: "dark", label: "Dark" },
  { value: "whimsical", label: "Whimsical" },
  { value: "serious", label: "Serious" },
  { value: "lighthearted", label: "Lighthearted" },
];

const LENGTH_OPTIONS = [
  { value: "short", label: "Short (1-2 paragraphs)" },
  { value: "medium", label: "Medium (3-4 paragraphs)" },
  { value: "long", label: "Long (5+ paragraphs)" },
];

export default function AIPostGenerator() {
  const [prompt, setPrompt] = useState("");
  const [postType, setPostType] = useState("");
  const [tone, setTone] = useState("");
  const [length, setLength] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [apiKey, setApiKey] = useState("");

  // Database state
  const [adventureJournal, setAdventureJournal] = useState<
    SelectAdventureJournal[]
  >([]);
  const [isLoadingJournal, setIsLoadingJournal] = useState(true);
  const [isSavingEntry, setIsSavingEntry] = useState(false);

  const [journalTitle, setJournalTitle] = useState("");
  const [journalTags, setJournalTags] = useState("");
  const [useJournalContext, setUseJournalContext] = useState(true);
  const [selectedJournalEntries, setSelectedJournalEntries] = useState<
    string[]
  >([]);
  const [addToContext, setAddToContext] = useState(true);
  const [showContextPreview, setShowContextPreview] = useState(false);
  const [customContext, setCustomContext] = useState("");

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

  useEffect(() => {
    // Initialize API key from localStorage on component mount
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    // Load journal entries
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    try {
      setIsLoadingJournal(true);
      const entries = await fetchJournalEntries();
      setAdventureJournal(entries);
    } catch (error) {
      console.error("Error loading journal entries:", error);
      // Handle error - could show toast notification
    } finally {
      setIsLoadingJournal(false);
    }
  };

  const generateAIResponse = async () => {
    if (!prompt.trim()) return;
    if (!apiKey.trim()) {
      alert("Please configure your OpenAI API key first");
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare context from selected journal entries
      const contextEntries = useJournalContext
        ? adventureJournal
            .filter((entry) => selectedJournalEntries.includes(entry.id))
            .slice(0, 5) // Limit to last 5 entries to avoid token limits
            .map((entry) => `${entry.title}: ${entry.content}`)
            .join("\n\n")
        : "";

      const fullContext = customContext
        ? `${contextEntries}\n\n${customContext}`
        : contextEntries;

      // Check context limits
      const contextCheck = checkContextLimits(fullContext, prompt);
      if (!contextCheck.withinLimits) {
        alert(
          `Context is too large (${contextCheck.estimatedTokens} tokens). Please reduce selected journal entries.`
        );
        setIsGenerating(false);
        return;
      }

      // Set API key in environment for the request
      process.env.NEXT_PUBLIC_OPENAI_API_KEY = apiKey;

      const response = await generateMouseGuardContent({
        prompt,
        postType,
        tone,
        length,
        context: fullContext,
      });

      const newPost: GeneratedPost = {
        id: Date.now().toString(),
        prompt,
        response,
        timestamp: new Date(),
        postType,
        tone,
        length,
        saved: false,
        usedContext: useJournalContext,
        contextEntries:
          selectedJournalEntries.length ||
          (useJournalContext ? adventureJournal.slice(0, 5).length : 0),
      };

      setGeneratedPosts((prev) => [newPost, ...prev]);
      setCurrentResponse(response);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setCurrentResponse(
        `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToJournal = async (post: GeneratedPost) => {
    if (!journalTitle.trim()) {
      alert("Please enter a title for the journal entry");
      return;
    }

    try {
      setIsSavingEntry(true);

      const tags = journalTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await createJournalEntry({
        title: journalTitle,
        content: post.response,
        tags,
      });

      // Reload journal entries to get the updated list
      await loadJournalEntries();

      // Mark post as saved
      setGeneratedPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, saved: true } : p))
      );

      // Reset form
      setJournalTitle("");
      setJournalTags("");

      // Show success message (you could use a toast here)
      alert("Journal entry saved successfully!");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      alert("Failed to save journal entry. Please try again.");
    } finally {
      setIsSavingEntry(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) {
      return;
    }

    try {
      await deleteJournalEntry(entryId);
      await loadJournalEntries();

      // Remove from selected entries if it was selected
      setSelectedJournalEntries((prev) => prev.filter((id) => id !== entryId));
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      alert("Failed to delete journal entry. Please try again.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const toggleJournalEntry = (entryId: string) => {
    if (selectedJournalEntries.includes(entryId)) {
      setSelectedJournalEntries(
        selectedJournalEntries.filter((id) => id !== entryId)
      );
    } else {
      setSelectedJournalEntries([...selectedJournalEntries, entryId]);
    }
  };

  const selectAllEntries = () => {
    setSelectedJournalEntries(adventureJournal.map((entry) => entry.id));
  };

  const clearAllEntries = () => {
    setSelectedJournalEntries([]);
  };

  const getContextPreview = () => {
    const contextEntries = adventureJournal
      .filter((entry) => selectedJournalEntries.includes(entry.id))
      .slice(0, 5)
      .map((entry) => `${entry.title}: ${entry.content}`)
      .join("\n\n");

    return customContext
      ? `${contextEntries}\n\n${customContext}`
      : contextEntries;
  };

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

      const mergedContent = await mergeJournalEntries(selectedEntries, apiKey);

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
      await loadJournalEntries();

      // Reset states
      setSelectedJournalEntries([]);
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
      const summary = await summarizeJournalEntry(entry, apiKey);
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
      await loadJournalEntries();

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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Wand2 className="w-8 h-8 text-purple-600" />
          AI Post Generator
        </h1>
        <p className="text-gray-600">
          Generate immersive content for your Mouse Guard adventures
        </p>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generator
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Adventure Journal
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <APIKeyManager onApiKeyChange={setApiKey} />
        </TabsContent>

        {/* AI Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          {!apiKey && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Please configure your OpenAI API key in the Settings tab to use
                AI generation.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Create Your Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Post Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Type
                  </label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose post type" />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone and Length */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone
                    </label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TONE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Length
                    </label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LENGTH_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Context Status */}
                {useJournalContext && selectedJournalEntries.length > 0 && (
                  <div className="border p-3 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">
                        Context Active
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700"
                      >
                        {selectedJournalEntries.length ||
                          adventureJournal.slice(0, 5).length}{" "}
                        entries
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-700">
                      AI will use selected adventure journal entries for story
                      continuity
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Configure context in the Adventure Journal tab
                    </p>
                  </div>
                )}

                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Prompt
                  </label>
                  <Textarea
                    placeholder="Describe the scene, character, or situation you want to generate content for..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateAIResponse}
                  disabled={
                    !prompt.trim() ||
                    !postType ||
                    !tone ||
                    isGenerating ||
                    !apiKey
                  }
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentResponse ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="whitespace-pre-wrap text-gray-800">
                        {currentResponse}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(currentResponse)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>

                      {/* Blog Integration */}
                      <BlogIntegration
                        generatedContent={currentResponse}
                        onPostCreated={() => {
                          console.log("Post created successfully!");
                        }}
                      />
                    </div>

                    {/* Save to Journal */}
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">
                          Save to Adventure Journal
                        </h4>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={addToContext}
                            onChange={(e) => setAddToContext(e.target.checked)}
                            className="rounded"
                          />
                          Add to context
                        </label>
                      </div>

                      <div className="space-y-2">
                        <Input
                          placeholder="Journal entry title..."
                          value={journalTitle}
                          onChange={(e) => setJournalTitle(e.target.value)}
                        />

                        <Input
                          placeholder="Tags (comma separated)..."
                          value={journalTags}
                          onChange={(e) => setJournalTags(e.target.value)}
                        />

                        <Button
                          size="sm"
                          onClick={() => saveToJournal(generatedPosts[0])}
                          disabled={
                            !generatedPosts.length ||
                            isSavingEntry ||
                            !journalTitle.trim()
                          }
                        >
                          {isSavingEntry ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-1" />
                              {addToContext
                                ? "Save & Add to Context"
                                : "Save Only"}
                            </>
                          )}
                        </Button>
                      </div>

                      {!addToContext && (
                        <p className="text-xs text-amber-600">
                          {`This entry will be saved but won't be used as context
                          for future AI generations`}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Generated content will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Adventure Journal Tab with Context Manager */}
        <TabsContent value="journal" className="space-y-6">
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
                    onClick={() => setUseJournalContext(!useJournalContext)}
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
                  <span className="text-gray-600">
                    ~{estimatedTokens} tokens
                  </span>
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
                      onClick={selectAllEntries}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllEntries}
                    >
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
              {isLoadingJournal && (
                <RefreshCw className="w-4 h-4 animate-spin" />
              )}
              <Badge variant="secondary">
                {adventureJournal.length} entries
              </Badge>
              <Button variant="outline" size="sm" onClick={loadJournalEntries}>
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
                              checked={selectedJournalEntries.includes(
                                entry.id
                              )}
                              onChange={() => toggleJournalEntry(entry.id)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                          </label>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {entry.title}
                          </CardTitle>
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
                    Generate AI content and save it to start building your
                    adventure journal
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
                      This will replace the {selectedJournalEntries.length}{" "}
                      selected entries with this single merged entry. This
                      action cannot be undone.
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
                      summary. The original content will be lost. This action
                      cannot be undone.
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
