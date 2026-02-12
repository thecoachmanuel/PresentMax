import { createOpenAI } from '@ai-sdk/openai';
import { env } from '@/env';

export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://github.com/thecoachmanuel/PresentMax', // Optional, for OpenRouter rankings
    'X-Title': 'PresentMax', // Optional, for OpenRouter rankings
  },
});

// DeepSeek R1 0528 (free)
export const textModel = openrouter('deepseek/deepseek-r1:free');

// Free Models Router
export const freeModelsModel = openrouter('openrouter/auto');
