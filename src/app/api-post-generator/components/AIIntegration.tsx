"use client";

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

export async function enhanceExistingContent(
  originalContent: string,
  enhancement: string
): Promise<string> {
  const systemPrompt = `You are helping enhance existing Mouse Guard RPG content. Take the original content and enhance it based on the user's request while maintaining consistency with the Mouse Guard setting and tone.

Mouse Guard is a tabletop RPG where players are anthropomorphic mice who serve as guardians protecting mouse settlements from predators and other dangers. The setting is medieval fantasy with a focus on small-scale adventures from a mouse perspective.

Maintain the original tone and style while incorporating the requested enhancements.`;

  const userPrompt = `Original Content: ${originalContent}

Enhancement Request: ${enhancement}

Please enhance the original content based on the request while maintaining consistency with the Mouse Guard setting.`;

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
          max_tokens: 600,
          temperature: 0.7,
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

    const enhancedContent = data.choices[0].message.content;

    if (!enhancedContent) {
      throw new Error("Empty response from OpenAI");
    }

    return enhancedContent.trim();
  } catch (error) {
    console.error("Error enhancing content:", error);
    throw new Error("Failed to enhance content. Please try again.");
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
