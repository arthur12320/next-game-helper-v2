"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  FileText,
  Brain,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";
import React from "react";

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isDefault: boolean;
}

export interface PromptTemplates {
  contentGeneration: PromptTemplate;
  mergeEntries: PromptTemplate;
  summarizeEntry: PromptTemplate;
}

// Default templates (your working prompts)
export const DEFAULT_TEMPLATES: PromptTemplates = {
  contentGeneration: {
    id: "content-generation-default",
    name: "Mouse Guard Content Generator",
    description:
      "Generates immersive Mouse Guard RPG content with context awareness",
    systemPrompt: `You are a creative writing assistant specializing in Mouse Guard RPG content. 

Mouse Guard is a tabletop RPG where players are anthropomorphic mice who serve as guardians protecting mouse settlements from predators and other dangers. The setting is medieval fantasy with a focus on:
- Small-scale adventures from a mouse perspective
- Seasonal challenges and natural dangers
- Honor, duty, and protecting the innocent
- Rich world-building with mouse cities, territories, and culture

{{CONTEXT_SECTION}}

Generate content that is:
- Appropriate for the Mouse Guard setting and tone
- Engaging for tabletop RPG play-by-post games
- Rich in sensory details and atmosphere
- Focused on the mouse perspective and scale
{{CONTEXT_CONSISTENCY}}

Post Type: {{POST_TYPE}}
Tone: {{TONE}}
Length: {{LENGTH}}`,
    userPromptTemplate: `Create {{POST_TYPE}} content with a {{TONE}} tone in {{LENGTH}} format based on this prompt: {{PROMPT}}`,
    isDefault: true,
  },
  mergeEntries: {
    id: "merge-entries-default",
    name: "Journal Entry Merger",
    description:
      "Consolidates multiple adventure journal entries into a cohesive narrative",
    systemPrompt: `You are a helpful assistant specializing in consolidating RPG adventure notes while preserving important details and narrative flow.`,
    userPromptTemplate: `You are helping to consolidate adventure journal entries for a Mouse Guard RPG campaign. 

Please merge the following journal entries into a single, concise entry that:
- Maintains all important story elements and character details
- Preserves chronological order of events
- Eliminates redundancy while keeping essential information
- Uses a narrative flow that connects the events naturally
- Maintains the Mouse Guard setting and tone

Entries to merge:

{{ENTRIES_TO_MERGE}}

Please provide a well-structured, consolidated entry that captures the essence of all the provided entries.`,
    isDefault: true,
  },
  summarizeEntry: {
    id: "summarize-entry-default",
    name: "Entry Summarizer",
    description:
      "Creates concise 100-150 character summaries of journal entries",
    systemPrompt: `You are a helpful assistant specializing in creating concise summaries of RPG adventure notes. Always respond with just the summary text, no additional formatting or explanation.`,
    userPromptTemplate: `You are helping to create concise summaries of adventure journal entries for a Mouse Guard RPG campaign.

Please summarize the following journal entry into a brief, informative summary of 100-150 characters that:
- Captures the key events or information
- Maintains the Mouse Guard setting and tone
- Is suitable for quick reference
- Preserves the most important details

Original entry:
**{{ENTRY_TITLE}}**
{{ENTRY_CONTENT}}

Please provide only the summary text, nothing else.`,
    isDefault: true,
  },
};

interface PromptTemplatesProps {
  onTemplatesChange?: (templates: PromptTemplates) => void;
}

// Move TemplateEditor outside and memoize it
const TemplateEditor = React.memo(
  ({
    template,
    onUpdateTemplate,
    onResetToDefault,
    showVariables,
    onToggleVariables,
    variables,
  }: {
    template: PromptTemplate;
    onUpdateTemplate: (field: keyof PromptTemplate, value: string) => void;
    onResetToDefault: () => void;
    showVariables: boolean;
    onToggleVariables: () => void;
    variables: string[];
  }) => {
    return (
      <div className="space-y-4">
        {/* Template Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {template.name}
              {template.isDefault ? (
                <Badge variant="secondary">Default</Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800">Custom</Badge>
              )}
            </h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetToDefault}
            disabled={template.isDefault}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Variables Reference */}
        <div className="border rounded-lg p-3 ">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium ">Available Variables</h4>
            <Button variant="ghost" size="sm" onClick={onToggleVariables}>
              {showVariables ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </Button>
          </div>
          {showVariables && (
            <div className="space-y-1">
              {variables.map((variable, index) => (
                <p key={index} className="text-xs  font-mono">
                  {variable}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt
          </label>
          <Textarea
            value={template.systemPrompt}
            onChange={(e) => onUpdateTemplate("systemPrompt", e.target.value)}
            rows={8}
            className="font-mono text-sm"
            placeholder="Enter the system prompt that defines the AI's role and behavior..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {`This sets the AI's role, personality, and general instructions.`}
          </p>
        </div>

        {/* User Prompt Template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Prompt Template
          </label>
          <Textarea
            value={template.userPromptTemplate}
            onChange={(e) =>
              onUpdateTemplate("userPromptTemplate", e.target.value)
            }
            rows={6}
            className="font-mono text-sm"
            placeholder="Enter the user prompt template with variables..."
          />
          <p className="text-xs text-gray-500 mt-1">
            This template is filled with actual values when making API calls.
            Use variables like {`{{ PROMPT }}`} for dynamic content.
          </p>
        </div>
      </div>
    );
  }
);

TemplateEditor.displayName = "TemplateEditor";

export default function PromptTemplates({
  onTemplatesChange,
}: PromptTemplatesProps) {
  const [templates, setTemplates] =
    useState<PromptTemplates>(DEFAULT_TEMPLATES);
  const [activeTab, setActiveTab] = useState("contentGeneration");
  const [showVariables, setShowVariables] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem("ai_prompt_templates");
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(parsed);
        onTemplatesChange?.(parsed);
      } catch (error) {
        console.error("Error loading saved templates:", error);
      }
    } else {
      onTemplatesChange?.(DEFAULT_TEMPLATES);
    }
  }, [onTemplatesChange]);

  const updateTemplate = useCallback(
    (
      templateType: keyof PromptTemplates,
      field: keyof PromptTemplate,
      value: string
    ) => {
      setTemplates((prev) => ({
        ...prev,
        [templateType]: {
          ...prev[templateType],
          [field]: value,
          isDefault: false, // Mark as custom when edited
        },
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const resetToDefault = useCallback((templateType: keyof PromptTemplates) => {
    setTemplates((prev) => ({
      ...prev,
      [templateType]: DEFAULT_TEMPLATES[templateType],
    }));
    setHasUnsavedChanges(true);
  }, []);

  const resetAllToDefaults = useCallback(() => {
    setTemplates(DEFAULT_TEMPLATES);
    setHasUnsavedChanges(true);
  }, []);

  const saveTemplates = useCallback(() => {
    localStorage.setItem("ai_prompt_templates", JSON.stringify(templates));
    onTemplatesChange?.(templates);
    setHasUnsavedChanges(false);
  }, [templates, onTemplatesChange]);

  const getVariablesForTemplate = useCallback(
    (templateType: keyof PromptTemplates) => {
      switch (templateType) {
        case "contentGeneration":
          return [
            "{{CONTEXT_SECTION}} - Replaced with context information if available",
            "{{CONTEXT_CONSISTENCY}} - Replaced with context consistency instruction",
            "{{POST_TYPE}} - The selected post type (narrative, dialogue, etc.)",
            "{{TONE}} - The selected tone (dramatic, humorous, etc.)",
            "{{LENGTH}} - The selected length (short, medium, long)",
            "{{PROMPT}} - The user's input prompt",
          ];
        case "mergeEntries":
          return [
            "{{ENTRIES_TO_MERGE}} - The formatted journal entries to be merged",
          ];
        case "summarizeEntry":
          return [
            "{{ENTRY_TITLE}} - The title of the journal entry",
            "{{ENTRY_CONTENT}} - The content of the journal entry",
          ];
        default:
          return [];
      }
    },
    []
  );

  // Create memoized handlers for each template type
  const handleContentGenerationUpdate = useCallback(
    (field: keyof PromptTemplate, value: string) => {
      updateTemplate("contentGeneration", field, value);
    },
    [updateTemplate]
  );

  const handleMergeEntriesUpdate = useCallback(
    (field: keyof PromptTemplate, value: string) => {
      updateTemplate("mergeEntries", field, value);
    },
    [updateTemplate]
  );

  const handleSummarizeEntryUpdate = useCallback(
    (field: keyof PromptTemplate, value: string) => {
      updateTemplate("summarizeEntry", field, value);
    },
    [updateTemplate]
  );

  const handleContentGenerationReset = useCallback(() => {
    resetToDefault("contentGeneration");
  }, [resetToDefault]);

  const handleMergeEntriesReset = useCallback(() => {
    resetToDefault("mergeEntries");
  }, [resetToDefault]);

  const handleSummarizeEntryReset = useCallback(() => {
    resetToDefault("summarizeEntry");
  }, [resetToDefault]);

  const toggleVariables = useCallback(() => {
    setShowVariables((prev) => !prev);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            AI Prompt Templates
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={resetAllToDefaults}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset All
            </Button>
            <Button onClick={saveTemplates} disabled={!hasUnsavedChanges}>
              <Save className="w-4 h-4 mr-1" />
              Save Templates
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Customize the AI prompts used for content generation, merging
            entries, and summarizing. Use variables like {`{{ PROMPT }}`} to
            insert dynamic content. Changes are saved locally and will persist
            across sessions.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="contentGeneration"
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Content Generation
            </TabsTrigger>
            <TabsTrigger
              value="mergeEntries"
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Merge Entries
            </TabsTrigger>
            <TabsTrigger
              value="summarizeEntry"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Summarize Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contentGeneration" className="mt-6">
            <TemplateEditor
              template={templates.contentGeneration}
              onUpdateTemplate={handleContentGenerationUpdate}
              onResetToDefault={handleContentGenerationReset}
              showVariables={showVariables}
              onToggleVariables={toggleVariables}
              variables={getVariablesForTemplate("contentGeneration")}
            />
          </TabsContent>

          <TabsContent value="mergeEntries" className="mt-6">
            <TemplateEditor
              template={templates.mergeEntries}
              onUpdateTemplate={handleMergeEntriesUpdate}
              onResetToDefault={handleMergeEntriesReset}
              showVariables={showVariables}
              onToggleVariables={toggleVariables}
              variables={getVariablesForTemplate("mergeEntries")}
            />
          </TabsContent>

          <TabsContent value="summarizeEntry" className="mt-6">
            <TemplateEditor
              template={templates.summarizeEntry}
              onUpdateTemplate={handleSummarizeEntryUpdate}
              onResetToDefault={handleSummarizeEntryReset}
              showVariables={showVariables}
              onToggleVariables={toggleVariables}
              variables={getVariablesForTemplate("summarizeEntry")}
            />
          </TabsContent>
        </Tabs>

        {hasUnsavedChanges && (
          <Alert className="mt-4 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {`You have unsaved changes to your prompt templates. Click "Save
              Templates" to apply them to future AI generations.`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
