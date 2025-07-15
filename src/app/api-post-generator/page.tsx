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
  MessageSquare,
  Scroll,
  Wand2,
  Eye,
  Edit,
  AlertTriangle,
} from "lucide-react";
import {
  generateMouseGuardContent,
  checkContextLimits,
} from "./components/AIIntegration";
import APIKeyManager from "./components/APIKeyManager";
import ContextManager from "./components/ContextManager";
import BlogIntegration from "./components/BlogIntegration";

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

interface AdventureJournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  tags: string[];
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
  const [adventureJournal, setAdventureJournal] = useState<
    AdventureJournalEntry[]
  >([
    {
      id: "1",
      title: "The Grain Delivery Mission",
      content:
        "Our patrol was tasked with escorting a grain shipment from Rootwallow to Lockhaven. The autumn winds were picking up, and Saxon warned us about potential weasel activity in the area. As we loaded the cart, I noticed Kenzie checking her sword more than usual - a sure sign she sensed trouble ahead.",
      timestamp: new Date(Date.now() - 86400000),
      tags: ["mission", "escort", "grain", "autumn"],
    },
    {
      id: "2",
      title: "Encounter with the Weasel",
      content:
        "As we approached the old bridge, Kenzie spotted movement in the underbrush. A massive weasel emerged, its yellow eyes fixed on our grain cart. The battle was fierce - Saxon's shield work saved us all when the beast lunged. We managed to drive it off, but not before it scattered half our cargo into the stream below.",
      timestamp: new Date(Date.now() - 172800000),
      tags: ["combat", "weasel", "bridge", "battle"],
    },
  ]);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalTags, setJournalTags] = useState("");
  const [useJournalContext, setUseJournalContext] = useState(true);
  const [selectedJournalEntries, setSelectedJournalEntries] = useState<
    string[]
  >([]);
  const [addToContext, setAddToContext] = useState(true);

  useEffect(() => {
    // Initialize API key from localStorage on component mount
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

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
            .filter(
              (entry) =>
                selectedJournalEntries.length === 0 ||
                selectedJournalEntries.includes(entry.id)
            )
            .slice(0, 5) // Limit to last 5 entries to avoid token limits
            .map((entry) => `${entry.title}: ${entry.content}`)
            .join("\n\n")
        : "";

      // Check context limits
      const contextCheck = checkContextLimits(contextEntries, prompt);
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
        context: contextEntries,
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

  const saveToJournal = (post: GeneratedPost) => {
    const newEntry: AdventureJournalEntry = {
      id: Date.now().toString(),
      title: journalTitle || `AI Generated: ${post.postType}`,
      content: post.response,
      timestamp: new Date(),
      tags: journalTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (addToContext) {
      setAdventureJournal((prev) => [newEntry, ...prev]);
    }

    // Mark post as saved
    setGeneratedPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, saved: true } : p))
    );

    // Reset form
    setJournalTitle("");
    setJournalTags("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
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
          <TabsTrigger value="history" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Generated Posts
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
          <ContextManager
            adventureJournal={adventureJournal}
            selectedEntries={selectedJournalEntries}
            onSelectionChange={setSelectedJournalEntries}
            useContext={useJournalContext}
            onContextToggle={setUseJournalContext}
          />
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
                {useJournalContext && (
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
                      AI will use adventure journal context for story continuity
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
                          // Optional: Add success feedback or refresh logic
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
                          disabled={!generatedPosts.length}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          {addToContext ? "Save & Add to Context" : "Save Only"}
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

        {/* Generated Posts History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Generated Posts History</h2>
            <Badge variant="secondary">{generatedPosts.length} posts</Badge>
          </div>

          {generatedPosts.length > 0 ? (
            <div className="space-y-4">
              {generatedPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{post.postType}</Badge>
                          <Badge variant="outline">{post.tone}</Badge>
                          <Badge variant="outline">{post.length}</Badge>
                          {post.usedContext && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700"
                            >
                              Context: {post.contextEntries} entries
                            </Badge>
                          )}
                          {post.saved && (
                            <Badge className="bg-green-100 text-green-800">
                              Saved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {post.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        Prompt:
                      </h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {post.prompt}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        Generated Content:
                      </h4>
                      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <p className="whitespace-pre-wrap text-gray-800">
                          {post.response}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(post.response)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>

                      <BlogIntegration
                        generatedContent={post.response}
                        onPostCreated={() => {
                          // Optional: Add success feedback or refresh logic
                          console.log("Post created successfully!");
                        }}
                      />

                      {!post.saved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentResponse(post.response);
                            // Switch to generator tab for saving
                          }}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save to Journal
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No generated posts yet</p>
              <p className="text-sm">
                Create your first AI-generated post in the Generator tab
              </p>
            </div>
          )}
        </TabsContent>

        {/* Adventure Journal Tab */}
        <TabsContent value="journal" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Adventure Journal</h2>
            <Badge variant="secondary">{adventureJournal.length} entries</Badge>
          </div>

          <div className="space-y-4">
            {adventureJournal.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {entry.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
