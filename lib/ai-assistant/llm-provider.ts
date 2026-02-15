/**
 * LLM Provider Abstract Interface
 * Defines the contract for LLM providers (OpenAI, Claude, etc.)
 */

import { LLMProvider, LLMRequest, LLMResponse, ModelInfo } from './types';

/**
 * Abstract base class for LLM providers
 */
export abstract class BaseLLMProvider implements LLMProvider {
  abstract name: string;

  /**
   * Send a request to the LLM
   * @param request - LLM request with prompt and parameters
   * @returns LLM response with content and token usage
   */
  abstract sendRequest(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Validate connection to the LLM provider
   * @returns True if connection is valid
   */
  abstract validateConnection(): Promise<boolean>;

  /**
   * Get information about the model
   * @returns Model information including max tokens and pricing
   */
  abstract getModelInfo(): Promise<ModelInfo>;

  /**
   * Format messages for the LLM
   * @param systemPrompt - System prompt
   * @param userPrompt - User prompt
   * @returns Formatted messages
   */
  protected formatMessages(systemPrompt: string | undefined, userPrompt: string) {
    const messages: Array<{ role: string; content: string }> = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
    
    messages.push({
      role: 'user',
      content: userPrompt,
    });
    
    return messages;
  }

  /**
   * Calculate cost of API call
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @returns Cost in USD
   */
  protected abstract calculateCost(inputTokens: number, outputTokens: number): number;
}

/**
 * Factory function to create LLM provider instances
 */
export function createLLMProvider(provider: string): BaseLLMProvider {
  switch (provider.toLowerCase()) {
    case 'openai':
      // Lazy import to avoid circular dependencies
      const { OpenAIProvider } = require('./openai-integration');
      return new OpenAIProvider();
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

/**
 * Get the default LLM provider
 */
export function getDefaultLLMProvider(): BaseLLMProvider {
  const provider = process.env.LLM_PROVIDER || 'openai';
  return createLLMProvider(provider);
}
