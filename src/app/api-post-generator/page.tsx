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
  Settings,
} from "lucide-react";
import {
  generateMouseGuardContent,
  checkContextLimits,
} from "./components/AIIntegration";
import APIKeyManager from "./components/APIKeyManager";
import BlogIntegration from "./components/BlogIntegration";
import {
  createJournalEntry,
  fetchJournalEntries,
} from "@/app/actions/adventure-journal";
import type { SelectAdventureJournal } from "@/db/schema/adventure-journal";
import PromptTemplates, {
  type PromptTemplates as PromptTemplatesType,
  DEFAULT_TEMPLATES,
} from "./components/PromptTemplate";
import AdventureJournalTab from "./components/adventure-journal-tabs";

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
  const [promptTemplates, setPromptTemplates] =
    useState<PromptTemplatesType>(DEFAULT_TEMPLATES);

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
  const [customContext, setCustomContext] = useState("");

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
        templates: promptTemplates,
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generator
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Adventure Journal
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Prompts
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
          <AdventureJournalTab
            adventureJournal={adventureJournal}
            isLoadingJournal={isLoadingJournal}
            useJournalContext={useJournalContext}
            selectedJournalEntries={selectedJournalEntries}
            customContext={customContext}
            apiKey={apiKey}
            promptTemplates={promptTemplates}
            onLoadJournalEntries={loadJournalEntries}
            onToggleJournalContext={() =>
              setUseJournalContext(!useJournalContext)
            }
            onToggleJournalEntry={toggleJournalEntry}
            onSelectAllEntries={selectAllEntries}
            onClearAllEntries={clearAllEntries}
            onCustomContextChange={setCustomContext}
          />
        </TabsContent>
        {/* Prompt Templates Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <PromptTemplates onTemplatesChange={setPromptTemplates} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
