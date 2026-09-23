import { log } from './logger';

/** Supported AI providers */
type AIProvider = 'openai' | 'gemini' | 'groq';

/** The strict classification prompt */
const CLASSIFY_PROMPT = (dreamName: string) =>
  `Classify this dream as Good or Bad. Reply with exactly one word: Good or Bad. Dream: ${dreamName}`;

/**
 * Determines which API key and endpoint to use based on AI_PROVIDER env var.
 */
function getProviderConfig(): {
  provider: AIProvider;
  apiKey: string;
  url: string;
  buildBody: (prompt: string) => object;
  extractAnswer: (json: any) => string;
} {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase() as AIProvider;
  let apiKey = '';
  let url = '';
  let buildBody: (prompt: string) => object;
  let extractAnswer: (json: any) => string;

  switch (provider) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY || '';
      url = 'https://api.openai.com/v1/chat/completions';
      buildBody = (prompt) => ({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 5,
      });
      extractAnswer = (json) => json.choices?.[0]?.message?.content?.trim() || '';
      break;

    case 'gemini':
      apiKey = process.env.GEMINI_API_KEY || '';
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
      buildBody = (prompt) => ({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 5 },
      });
      extractAnswer = (json) =>
        json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      break;

    case 'groq':
      apiKey = process.env.GROQ_API_KEY || '';
      url = 'https://api.groq.com/openai/v1/chat/completions';
      buildBody = (prompt) => ({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 5,
      });
      extractAnswer = (json) => json.choices?.[0]?.message?.content?.trim() || '';
      break;

    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }

  return { provider, apiKey, url, buildBody, extractAnswer };
}

/**
 * Check if an AI API key is configured and non-empty.
 */
export function isAIConfigured(): boolean {
  const { apiKey } = getProviderConfig();
  return apiKey.length > 0 && !apiKey.includes('your-');
}

/**
 * Classify a dream name as "Good" or "Bad" using the configured AI provider.
 * Includes retry logic (up to 3 attempts) and timeout handling.
 */
export async function classifyDream(dreamName: string): Promise<'Good' | 'Bad'> {
  const { provider, apiKey, url, buildBody, extractAnswer } = getProviderConfig();
  const prompt = CLASSIFY_PROMPT(dreamName);
  const body = buildBody(prompt);

  log(`[AI] Classifying "${dreamName}" via ${provider}...`);

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      // OpenAI and Groq use Bearer auth; Gemini uses query param (already in URL)
      if (provider === 'openai' || provider === 'groq') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const raw = extractAnswer(json);

      // Normalise the response: accept "good", "Good", "GOOD", etc.
      const normalised = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

      if (normalised !== 'Good' && normalised !== 'Bad') {
        throw new Error(`Unexpected AI response: "${raw}" (normalised: "${normalised}")`);
      }

      log(`[AI] "${dreamName}" → ${normalised}`);
      return normalised as 'Good' | 'Bad';
    } catch (error) {
      lastError = error as Error;
      log(`[AI] Attempt ${attempt}/${maxRetries} failed for "${dreamName}": ${lastError.message}`);
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw new Error(`Failed to classify "${dreamName}" after ${maxRetries} attempts: ${lastError?.message}`);
}
