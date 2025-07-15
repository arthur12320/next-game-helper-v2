"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  Edit,
  BookOpen,
  Users,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { fetchChapters } from "@/app/actions/chapters";
import { addPost } from "@/app/actions/posts";
import { fetchCampaigns } from "@/app/actions/campaign";

interface Campaign {
  id: string;
  name: string;
  creatorId: string;
  dmId: string;
  description: string | null;
}

interface Chapter {
  id: string;
  name: string;
  createdAt: Date;
  campaignId: string;
}

interface BlogIntegrationProps {
  generatedContent: string;
  onPostCreated?: () => void;
}

export default function BlogIntegration({
  generatedContent,
  onPostCreated,
}: BlogIntegrationProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [content, setContent] = useState(generatedContent);
  const [isPosting, setIsPosting] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [postStatus, setPostStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Load campaigns on component mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Load chapters when campaign is selected
  useEffect(() => {
    if (selectedCampaign) {
      loadChapters(selectedCampaign);
    } else {
      setChapters([]);
      setSelectedChapter("");
    }
  }, [selectedCampaign]);

  // Update content when generatedContent changes
  useEffect(() => {
    setContent(generatedContent);
  }, [generatedContent]);

  const loadCampaigns = async () => {
    try {
      setIsLoadingCampaigns(true);
      const campaignData = await fetchCampaigns();
      setCampaigns(campaignData);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setErrorMessage("Failed to load campaigns");
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const loadChapters = async (campaignId: string) => {
    try {
      setIsLoadingChapters(true);
      const chapterData = await fetchChapters(campaignId);
      setChapters(chapterData);
    } catch (error) {
      console.error("Error loading chapters:", error);
      setErrorMessage("Failed to load chapters");
    } finally {
      setIsLoadingChapters(false);
    }
  };

  const handlePost = async () => {
    if (!selectedChapter || !content.trim()) {
      setErrorMessage(
        "Please select a chapter and ensure content is not empty"
      );
      return;
    }

    setIsPosting(true);
    setPostStatus("idle");
    setErrorMessage("");

    try {
      await addPost({
        chapterId: selectedChapter,
        markdown: content.trim(),
        // Note: diceRolls could be added here if needed for AI-generated content
        // diceRolls: []
      });

      setPostStatus("success");
      onPostCreated?.();

      // Reset form after successful post
      setTimeout(() => {
        setContent("");
        setPostStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error posting to campaign:", error);
      setPostStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create post"
      );
    } finally {
      setIsPosting(false);
    }
  };

  const selectedCampaignData = campaigns.find((c) => c.id === selectedCampaign);
  const selectedChapterData = chapters.find((c) => c.id === selectedChapter);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Post to Campaign
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campaign Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Select Campaign
          </label>
          <Select
            value={selectedCampaign}
            onValueChange={setSelectedCampaign}
            disabled={isLoadingCampaigns}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingCampaigns
                    ? "Loading campaigns..."
                    : "Choose a campaign"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  <div>
                    <div className="font-medium">{campaign.name}</div>
                    {campaign.description && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {campaign.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chapter Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 inline mr-1" />
            Select Chapter
          </label>
          <Select
            value={selectedChapter}
            onValueChange={setSelectedChapter}
            disabled={!selectedCampaign || isLoadingChapters}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedCampaign
                    ? "Select a campaign first"
                    : isLoadingChapters
                    ? "Loading chapters..."
                    : "Choose a chapter"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((chapter) => (
                <SelectItem key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selection Summary */}
        {selectedCampaignData && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                {selectedCampaignData.name}
              </Badge>
              {selectedChapterData && (
                <>
                  <span className="text-blue-600">→</span>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700"
                  >
                    {selectedChapterData.name}
                  </Badge>
                </>
              )}
            </div>
            <p className="text-xs text-blue-700">
              Your AI-generated content will be posted to this chapter
            </p>
          </div>
        )}

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <Textarea
            placeholder="Edit the generated content or write your own..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Content supports Markdown formatting
          </p>
        </div>

        {/* Error Display */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {postStatus === "success" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Post created successfully! It has been added to the selected
              chapter.
            </AlertDescription>
          </Alert>
        )}

        {/* Post Button */}
        <Button
          onClick={handlePost}
          disabled={!selectedChapter || !content.trim() || isPosting}
          className="w-full"
        >
          {isPosting ? (
            <>
              <Send className="w-4 h-4 mr-2 animate-pulse" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Post to Chapter
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Posts will be visible to all campaign members</p>
          <p>• Content will be formatted as Markdown</p>
          <p>• You can edit posts after creation in the campaign view</p>
        </div>
      </CardContent>
    </Card>
  );
}
