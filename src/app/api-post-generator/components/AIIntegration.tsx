"use client";

import { SelectAdventureJournal } from "@/db/schema/adventure-journal";

interface AIGenerationParams {
  prompt: string;
  postType: string;
  tone: string;
  length: string;
  context?: string;
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

export async function generateMouseGuardContent({
  prompt,
  postType,
  tone,
  length,
  context = "",
}: AIGenerationParams): Promise<string> {
  const systemPrompt = `You are a creative writing assistant specializing in Mouse Guard RPG content. 

Mouse Guard is a tabletop RPG where players are anthropomorphic mice who serve as guardians protecting mouse settlements from predators and other dangers. The setting is medieval fantasy with a focus on:
- Small-scale adventures from a mouse perspective
- Seasonal challenges and natural dangers
- Honor, duty, and protecting the innocent
- Rich world-building with mouse cities, territories, and culture

${
  context
    ? `
ADVENTURE CONTEXT (Previous events and story elements to maintain continuity):
${context}

Please reference and build upon these previous events when appropriate, maintaining story continuity and character consistency.
`
    : ""
}

Generate content that is:
- Appropriate for the Mouse Guard setting and tone
- Engaging for tabletop RPG play-by-post games
- Rich in sensory details and atmosphere
- Focused on the mouse perspective and scale
${context ? "- Consistent with the provided adventure context" : ""}

Post Type: ${postType}
Tone: ${tone}
Length: ${length}`;

  const userPrompt = `Create ${postType} content with a ${tone} tone in ${length} format based on this prompt: ${prompt}`;

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
  apiKey: string
): Promise<string> {
  if (entries.length < 2) {
    throw new Error("At least 2 entries are required for merging");
  }

  const entriesToMerge = entries
    .map((entry) => `**${entry.title}**\n${entry.content}`)
    .join("\n\n---\n\n");

  const mergePrompt = `You are helping to consolidate adventure journal entries for a Mouse Guard RPG campaign. 

Please merge the following journal entries into a single, concise entry that:
- Maintains all important story elements and character details
- Preserves chronological order of events
- Eliminates redundancy while keeping essential information
- Uses a narrative flow that connects the events naturally
- Maintains the Mouse Guard setting and tone

Entries to merge:

${entriesToMerge}

Please provide a well-structured, consolidated entry that captures the essence of all the provided entries.`;

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
            content:
              "You are a helpful assistant specializing in consolidating RPG adventure notes while preserving important details and narrative flow.",
          },
          {
            role: "user",
            content: mergePrompt,
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
  apiKey: string
): Promise<string> {
  const summarizePrompt = `You are helping to create concise summaries of adventure journal entries for a Mouse Guard RPG campaign.

Please summarize the following journal entry into a brief, informative summary of 150 characters that:
- Captures the key events or information
- Maintains the Mouse Guard setting and tone
- Is suitable for quick reference
- Preserves the most important details

Original entry:
**${entry.title}**
${entry.content}

Please provide only the summary text, nothing else.`;

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
            content:
              "You are a helpful assistant specializing in creating concise summaries of RPG adventure notes. Always respond with just the summary text, no additional formatting or explanation.",
          },
          {
            role: "user",
            content: summarizePrompt,
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
