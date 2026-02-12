import { createOpenAI } from "@ai-sdk/openai";
import { type LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";
import { openrouter } from "./ai";

/**
 * Centralized model picker function for all presentation generation routes
 * Supports OpenAI, Ollama, LM Studio, and OpenRouter models
 */
export function modelPicker(
  modelProvider: string,
  modelId?: string,
): LanguageModelV1 {
  if (modelProvider === "openrouter") {
    return openrouter(modelId || "deepseek/deepseek-r1:free") as unknown as LanguageModelV1;
  }

  if (modelProvider === "ollama" && modelId) {
    // Use Ollama AI provider
    const ollama = createOllama();
    return ollama(modelId) as unknown as LanguageModelV1;
  }

  if (modelProvider === "lmstudio" && modelId) {
    // Use LM Studio with OpenAI compatible provider
    const lmstudio = createOpenAI({
      name: "lmstudio",
      baseURL: "http://localhost:1234/v1",
      apiKey: "lmstudio",
    });
    return lmstudio(modelId) as unknown as LanguageModelV1;
  }

  // Default to OpenRouter DeepSeek R1 (free)
  return openrouter("deepseek/deepseek-r1:free") as unknown as LanguageModelV1;
}
