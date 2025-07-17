"use client";

import { SelectAdventureJournal } from "@/db/schema/adventure-journal";
import { DEFAULT_TEMPLATES, type PromptTemplates } from "./PromptTemplate";

interface AIGenerationParams {
  prompt: string;
  postType: string;
  tone: string;
  length: string;
  context?: string;
  templates?: PromptTemplates;
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Helper function to replace template variables
function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      value
    );
  });
  return result;
}

export async function generateMouseGuardContent({
  prompt,
  postType,
  tone,
  length,
  context = "",
  templates = DEFAULT_TEMPLATES,
}: AIGenerationParams): Promise<string> {
  const template = templates.contentGeneration;

  // Prepare context section
  const contextSection = context
    ? `
ADVENTURE CONTEXT (Previous events and story elements to maintain continuity):
${context}

Please reference and build upon these previous events when appropriate, maintaining story continuity and character consistency.
`
    : "";

  const contextConsistency = context
    ? "- Consistent with the provided adventure context"
    : "";

  // Replace variables in system prompt
  const systemPrompt = replaceTemplateVariables(template.systemPrompt, {
    CONTEXT_SECTION: contextSection,
    CONTEXT_CONSISTENCY: contextConsistency,
    POST_TYPE: postType,
    TONE: tone,
    LENGTH: length,
  });

  // Replace variables in user prompt
  const userPrompt = replaceTemplateVariables(template.userPromptTemplate, {
    POST_TYPE: postType,
    TONE: tone,
    LENGTH: length,
    PROMPT: prompt,
  });

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  // Get max tokens based on length
  const getMaxTokens = (length: string): number => {
    switch (length) {
      case "short":
        return 300;
      case "medium":
        return 500;
      case "long":
        return 800;
      default:
        return 500;
    }
  };

  try {
    const openAiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messages,
          max_tokens: getMaxTokens(length),
          temperature: 0.8,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      }
    );

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(
        `OpenAI API Error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data: OpenAIResponse = await openAiResponse.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response generated from OpenAI");
    }

    const generatedContent = data.choices[0].message.content;

    if (!generatedContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Log token usage for monitoring
    if (data.usage) {
      console.log("Token usage:", {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
      });
    }

    return generatedContent.trim();
  } catch (error) {
    console.error("Error generating AI content:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error(
          "OpenAI API key is missing or invalid. Please check your configuration."
        );
      } else if (error.message.includes("quota")) {
        throw new Error(
          "OpenAI API quota exceeded. Please check your usage limits."
        );
      } else if (error.message.includes("rate limit")) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment and try again."
        );
      }
    }

    throw new Error("Failed to generate content. Please try again.");
  }
}

export async function mergeJournalEntries(
  entries: SelectAdventureJournal[],
  apiKey: string,
  templates: PromptTemplates = DEFAULT_TEMPLATES
): Promise<string> {
  if (entries.length < 2) {
    throw new Error("At least 2 entries are required for merging");
  }

  const template = templates.mergeEntries;
  const entriesToMerge = entries
    .map((entry) => `**${entry.title}**\n${entry.content}`)
    .join("\n\n---\n\n");

  // Replace variables in user prompt
  const userPrompt = replaceTemplateVariables(template.userPromptTemplate, {
    ENTRIES_TO_MERGE: entriesToMerge,
  });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: template.systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to merge entries");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error merging entries:", error);
    throw new Error(
      `Failed to merge entries: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function summarizeJournalEntry(
  entry: SelectAdventureJournal,
  apiKey: string,
  templates: PromptTemplates = DEFAULT_TEMPLATES
): Promise<string> {
  const template = templates.summarizeEntry;

  // Replace variables in user prompt
  const userPrompt = replaceTemplateVariables(template.userPromptTemplate, {
    ENTRY_TITLE: entry.title,
    ENTRY_CONTENT: entry.content,
  });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: template.systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to summarize entry");
    }

    const data = await response.json();
    const summary = data.choices[0].message.content.trim();

    // Ensure the summary is within the character limit
    if (summary.length > 150) {
      return summary.substring(0, 147) + "...";
    }

    return summary;
  } catch (error) {
    console.error("Error summarizing entry:", error);
    throw new Error(
      `Failed to summarize entry: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Utility function to estimate token count (rough approximation)
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Function to validate API key format
export function validateApiKey(apiKey: string): boolean {
  return apiKey.startsWith("sk-") && apiKey.length > 20;
}

// Function to check if we're approaching context limits
export function checkContextLimits(
  context: string,
  prompt: string
): {
  withinLimits: boolean;
  estimatedTokens: number;
  maxTokens: number;
} {
  const contextTokens = estimateTokenCount(context);
  const promptTokens = estimateTokenCount(prompt);
  const systemPromptTokens = 500; // Rough estimate for system prompt
  const totalTokens = contextTokens + promptTokens + systemPromptTokens;

  // GPT-4o-mini has a 128k context window, but we'll be conservative
  const maxTokens = 16000; // Leave room for response

  return {
    withinLimits: totalTokens < maxTokens,
    estimatedTokens: totalTokens,
    maxTokens,
  };
}
