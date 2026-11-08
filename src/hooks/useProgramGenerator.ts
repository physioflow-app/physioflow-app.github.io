import { useState, useCallback } from 'react';
import { IntakeDetails, Program } from '../types';
import { buildPrompt, PromptOptions } from '../lib/promptBuilder';
import { SafetyStopError } from '../lib/safety';
import { parseProgram } from '../lib/programParser';
import { matchVideos } from '../lib/videoMatcher';

export type GeneratorStatus = 'ready' | 'generating' | 'error';

interface UseProgramGeneratorReturn {
  status: GeneratorStatus;
  error: string | null;
  generate: (description: string, details?: IntakeDetails, options?: PromptOptions) => Promise<Program>;
}

// In production, requests go through the Cloudflare Worker proxy (no API key in the browser).
// An override applies in both development and production.
const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || (import.meta.env.DEV
  ? '/api/gemini'
  : 'https://pt-gemini-proxy.itzsid.workers.dev');

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
}

/** Generates a program by sending the user's description to Gemini through the Worker proxy. */
export function useProgramGenerator(): UseProgramGeneratorReturn {
  const [status, setStatus] = useState<GeneratorStatus>('ready');
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (description: string, details: IntakeDetails = {}, options: PromptOptions = {}): Promise<Program> => {
    setStatus('generating');
    setError(null);

    try {
      const messages = buildPrompt(description, details, options);

      // Convert chat messages to Gemini format
      const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
      const userMessage = messages.find(m => m.role === 'user')?.content || '';

      const maxRetries = 3;
      let lastError: Error | null = null;
      let data: GeminiResponse | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const controller = new AbortController();
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
          if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }

          timeout = setTimeout(() => controller.abort(), 45000);
          const response = await fetch(PROXY_URL, {
            signal: controller.signal,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: 'user', parts: [{ text: userMessage }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
              },
            }),
          });

          if (!response.ok) {
            if (response.status === 429) {
              lastError = new Error('AI service is temporarily busy. Please wait a moment and try again.');
              continue;
            }
            lastError = new Error(`AI service error (${response.status}). Please try again.`);
            if (response.status < 500 && response.status !== 408) break;
            continue;
          }

          data = await response.json();
          lastError = null;
          break;
        } catch (fetchErr) {
          lastError = controller.signal.aborted
            ? new Error('AI service timed out. Please try again.')
            : fetchErr instanceof Error ? fetchErr : new Error('Failed to fetch');
        } finally {
          clearTimeout(timeout);
        }
      }

      if (lastError || !data) {
        throw lastError || new Error('Failed to fetch after retries');
      }
      const output = data.candidates?.[0]?.content?.parts
        ?.filter((part) => !part.thought && typeof part.text === 'string')
        .map((part) => part.text).join('');

      if (!output) {
        throw new Error('No output from Gemini');
      }

      let program = parseProgram(output);
      program.searchQuery = description;
      program.createdAt = new Date().toISOString();
      program = matchVideos(program);

      setStatus('ready');
      return program;
    } catch (err) {
      setStatus('error');
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      throw err instanceof SafetyStopError ? err : new Error(message);
    }
  }, []);

  return { status, error, generate };
}
