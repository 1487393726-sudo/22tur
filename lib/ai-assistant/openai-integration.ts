/**
 * OpenAI Integration
 * Implements LLM provider interface for OpenAI API
 */

import { BaseLLMProvider } from './llm-provider';
import { LLMRequest, LLMResponse, ModelInfo } from './types';
import { decrypt, encrypt } from './encryption';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI LLM Provider Implementation
 * **Property 7: API 密钥加密**
 */
export class OpenAIProvider extends BaseLLMProvider {
  name = 'openai';
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    super();
    const encryptedKey = process.env.OPENAI_API_KEY;
    if (!encryptedKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    // Try to decrypt if it's encrypted, otherwise use as-is
    try {
      this.apiKey = decrypt(encryptedKey);
    } catch {
      // If decryption fails, assume it's a plain key
      this.apiKey = encryptedKey;
    }
  }

  /**
   * Send request to OpenAI API
   */
  async sendRequest(request: LLMRequest): Promise<LLMResponse> {
    const model = request.model || process.env.OPENAI_MODEL || 'gpt-4';
    const temperature = request.temperature ?? 0.7;
    const maxTokens = request.maxTokens || parseInt(process.env.OPENAI_MAX_TOKENS || '2000');

    const messages: OpenAIMessage[] = [];
    
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      });
    }
    
    messages.push({
      role: 'user',
      content: request.prompt,
    });

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data: OpenAIResponse = await response.json();
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        tokens: {
          input: data.usage.prompt_tokens,
          output: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        },
        model: data.model,
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      throw new Error(`Failed to send request to OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate OpenAI API connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get OpenAI model information
   */
  async getModelInfo(): Promise<ModelInfo> {
    const model = process.env.OPENAI_MODEL || 'gpt-4';
    
    // Model information based on OpenAI's pricing
    const modelInfo: Record<string, ModelInfo> = {
      'gpt-4': {
        name: 'GPT-4',
        provider: 'openai',
        maxTokens: 8192,
        costPer1kTokens: {
          input: 0.03,
          output: 0.06,
        },
      },
      'gpt-4-turbo': {
        name: 'GPT-4 Turbo',
        provider: 'openai',
        maxTokens: 128000,
        costPer1kTokens: {
          input: 0.01,
          output: 0.03,
        },
      },
      'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        maxTokens: 4096,
        costPer1kTokens: {
          input: 0.0005,
          output: 0.0015,
        },
      },
    };

    return modelInfo[model] || modelInfo['gpt-4'];
  }

  /**
   * Calculate cost of API call
   */
  protected calculateCost(inputTokens: number, outputTokens: number): number {
    const modelInfo = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    };

    const model = process.env.OPENAI_MODEL || 'gpt-4';
    const pricing = modelInfo[model as keyof typeof modelInfo] || modelInfo['gpt-4'];

    return (inputTokens * pricing.input + outputTokens * pricing.output) / 1000;
  }
}

/**
 * Encrypt and store OpenAI API key
 * @param apiKey - Plain text API key
 * @returns Encrypted key
 */
export function encryptOpenAIKey(apiKey: string): string {
  return encrypt(apiKey);
}

/**
 * Get OpenAI provider instance
 */
export function getOpenAIProvider(): OpenAIProvider {
  return new OpenAIProvider();
}
