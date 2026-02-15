/**
 * Unit Tests for LLM Integration Layer
 * **Feature: ai-project-assistant, Property 7: API 密钥加密**
 * **Validates: Requirements 9.1**
 * 
 * Tests encryption/decryption of API keys and LLM provider functionality
 */

import { encrypt, decrypt, hash, verifyHash } from '../encryption';
import { BaseLLMProvider, createLLMProvider, getDefaultLLMProvider } from '../llm-provider';
import { OpenAIProvider, encryptOpenAIKey, getOpenAIProvider } from '../openai-integration';
import { LLMRequest, LLMResponse } from '../types';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.AI_ENCRYPTION_KEY = 'test-encryption-key-for-unit-tests';
  process.env.OPENAI_API_KEY = 'sk-test-key-12345';
  process.env.OPENAI_MODEL = 'gpt-4';
  process.env.OPENAI_MAX_TOKENS = '2000';
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Encryption Module', () => {
  describe('encrypt and decrypt round-trip', () => {
    it('should encrypt and decrypt a simple API key', () => {
      const apiKey = 'sk-test-key-12345';
      const encrypted = encrypt(apiKey);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(apiKey);
    });

    it('should encrypt and decrypt a complex API key with special characters', () => {
      const apiKey = 'sk-proj-abc123!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encrypt(apiKey);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(apiKey);
    });

    it('should encrypt and decrypt empty string', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt long strings', () => {
      const longString = 'a'.repeat(10000);
      const encrypted = encrypt(longString);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(longString);
    });

    it('should produce different ciphertexts for the same plaintext (due to random IV)', () => {
      const plaintext = 'test-key';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      
      // Ciphertexts should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to the same plaintext
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });
  });

  describe('encryption format validation', () => {
    it('should produce encrypted data in format: iv:authTag:encryptedData', () => {
      const plaintext = 'test-key';
      const encrypted = encrypt(plaintext);
      const parts = encrypted.split(':');
      
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBeTruthy(); // IV
      expect(parts[1]).toBeTruthy(); // Auth tag
      expect(parts[2]).toBeTruthy(); // Encrypted data
    });

    it('should throw error when decrypting invalid format', () => {
      const invalidEncrypted = 'invalid:format';
      
      expect(() => decrypt(invalidEncrypted)).toThrow('Invalid encrypted data format');
    });

    it('should throw error when decrypting corrupted data', () => {
      const plaintext = 'test-key';
      const encrypted = encrypt(plaintext);
      const parts = encrypted.split(':');
      
      // Corrupt the encrypted data
      const corrupted = `${parts[0]}:${parts[1]}:corrupted${parts[2]}`;
      
      expect(() => decrypt(corrupted)).toThrow();
    });
  });

  describe('hash functions', () => {
    it('should hash a value consistently', () => {
      const value = 'test-value';
      const hash1 = hash(value);
      const hash2 = hash(value);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different values', () => {
      const hash1 = hash('value1');
      const hash2 = hash('value2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct hash', () => {
      const value = 'test-value';
      const hashed = hash(value);
      
      expect(verifyHash(value, hashed)).toBe(true);
    });

    it('should reject incorrect hash', () => {
      const value = 'test-value';
      const hashed = hash(value);
      
      expect(verifyHash('wrong-value', hashed)).toBe(false);
    });
  });

  describe('encryption key management', () => {
    it('should throw error when AI_ENCRYPTION_KEY is not set', () => {
      delete process.env.AI_ENCRYPTION_KEY;
      
      expect(() => encrypt('test')).toThrow('AI_ENCRYPTION_KEY environment variable is not set');
    });

    it('should use AI_ENCRYPTION_KEY from environment', () => {
      process.env.AI_ENCRYPTION_KEY = 'custom-key-123';
      
      const plaintext = 'test-data';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle different encryption keys correctly', () => {
      const plaintext = 'test-data';
      
      // Encrypt with key1
      process.env.AI_ENCRYPTION_KEY = 'key1';
      const encrypted1 = encrypt(plaintext);
      
      // Try to decrypt with key2 (should fail)
      process.env.AI_ENCRYPTION_KEY = 'key2';
      expect(() => decrypt(encrypted1)).toThrow();
    });
  });
});

describe('LLM Provider Factory', () => {
  describe('createLLMProvider', () => {
    it('should create OpenAI provider', () => {
      const provider = createLLMProvider('openai');
      
      expect(provider).toBeInstanceOf(BaseLLMProvider);
      expect(provider.name).toBe('openai');
    });

    it('should create OpenAI provider with case-insensitive name', () => {
      const provider1 = createLLMProvider('OPENAI');
      const provider2 = createLLMProvider('OpenAI');
      
      expect(provider1.name).toBe('openai');
      expect(provider2.name).toBe('openai');
    });

    it('should throw error for unsupported provider', () => {
      expect(() => createLLMProvider('unsupported')).toThrow('Unsupported LLM provider: unsupported');
    });
  });

  describe('getDefaultLLMProvider', () => {
    it('should return OpenAI provider by default', () => {
      delete process.env.LLM_PROVIDER;
      const provider = getDefaultLLMProvider();
      
      expect(provider.name).toBe('openai');
    });

    it('should use LLM_PROVIDER environment variable', () => {
      process.env.LLM_PROVIDER = 'openai';
      const provider = getDefaultLLMProvider();
      
      expect(provider.name).toBe('openai');
    });
  });
});

describe('OpenAI Provider', () => {
  describe('initialization', () => {
    it('should initialize with API key from environment', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      
      const provider = new OpenAIProvider();
      expect(provider.name).toBe('openai');
    });

    it('should throw error when OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY;
      
      expect(() => new OpenAIProvider()).toThrow('OPENAI_API_KEY environment variable is not set');
    });

    it('should handle encrypted API key', () => {
      const plainKey = 'sk-test-key-12345';
      const encryptedKey = encrypt(plainKey);
      process.env.OPENAI_API_KEY = encryptedKey;
      
      // Should not throw
      const provider = new OpenAIProvider();
      expect(provider.name).toBe('openai');
    });

    it('should handle plain API key when decryption fails', () => {
      process.env.OPENAI_API_KEY = 'sk-plain-key-not-encrypted';
      
      // Should not throw
      const provider = new OpenAIProvider();
      expect(provider.name).toBe('openai');
    });
  });

  describe('getModelInfo', () => {
    it('should return model information for gpt-4', async () => {
      process.env.OPENAI_MODEL = 'gpt-4';
      const provider = new OpenAIProvider();
      
      const modelInfo = await provider.getModelInfo();
      
      expect(modelInfo.name).toBe('GPT-4');
      expect(modelInfo.provider).toBe('openai');
      expect(modelInfo.maxTokens).toBe(8192);
      expect(modelInfo.costPer1kTokens.input).toBe(0.03);
      expect(modelInfo.costPer1kTokens.output).toBe(0.06);
    });

    it('should return model information for gpt-4-turbo', async () => {
      process.env.OPENAI_MODEL = 'gpt-4-turbo';
      const provider = new OpenAIProvider();
      
      const modelInfo = await provider.getModelInfo();
      
      expect(modelInfo.name).toBe('GPT-4 Turbo');
      expect(modelInfo.maxTokens).toBe(128000);
    });

    it('should return model information for gpt-3.5-turbo', async () => {
      process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
      const provider = new OpenAIProvider();
      
      const modelInfo = await provider.getModelInfo();
      
      expect(modelInfo.name).toBe('GPT-3.5 Turbo');
      expect(modelInfo.maxTokens).toBe(4096);
    });

    it('should return default model info for unknown model', async () => {
      process.env.OPENAI_MODEL = 'unknown-model';
      const provider = new OpenAIProvider();
      
      const modelInfo = await provider.getModelInfo();
      
      expect(modelInfo.name).toBe('GPT-4');
    });
  });

  describe('validateConnection', () => {
    it('should validate connection with valid API key', async () => {
      // Mock fetch for successful response
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      );

      const provider = new OpenAIProvider();
      const isValid = await provider.validateConnection();

      expect(isValid).toBe(true);
    });

    it('should return false for invalid API key', async () => {
      // Mock fetch for failed response
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
        } as Response)
      );

      const provider = new OpenAIProvider();
      const isValid = await provider.validateConnection();

      expect(isValid).toBe(false);
    });

    it('should return false on network error', async () => {
      // Mock fetch for network error
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      const provider = new OpenAIProvider();
      const isValid = await provider.validateConnection();

      expect(isValid).toBe(false);
    });
  });

  describe('encryptOpenAIKey helper', () => {
    it('should encrypt API key', () => {
      const apiKey = 'sk-test-key-12345';
      const encrypted = encryptOpenAIKey(apiKey);
      
      expect(encrypted).not.toBe(apiKey);
      expect(decrypt(encrypted)).toBe(apiKey);
    });

    it('should produce different encrypted values for same key', () => {
      const apiKey = 'sk-test-key-12345';
      const encrypted1 = encryptOpenAIKey(apiKey);
      const encrypted2 = encryptOpenAIKey(apiKey);
      
      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(apiKey);
      expect(decrypt(encrypted2)).toBe(apiKey);
    });
  });

  describe('getOpenAIProvider helper', () => {
    it('should return OpenAI provider instance', () => {
      const provider = getOpenAIProvider();
      
      expect(provider).toBeInstanceOf(OpenAIProvider);
      expect(provider.name).toBe('openai');
    });
  });
});

describe('Property 7: API Key Encryption', () => {
  /**
   * Property 7: API 密钥加密
   * All stored API keys should be encrypted using AES-256 encryption,
   * and only authorized system components can access them.
   * **Validates: Requirements 9.1**
   */

  it('should encrypt all API keys before storage', () => {
    const plainKey = 'sk-test-key-12345';
    const encrypted = encrypt(plainKey);
    
    // Encrypted key should not contain the plain key
    expect(encrypted).not.toContain(plainKey);
    expect(encrypted).not.toContain('sk-test');
  });

  it('should decrypt API keys only with correct encryption key', () => {
    const plainKey = 'sk-test-key-12345';
    const encrypted = encrypt(plainKey);
    
    // Decrypt with correct key
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plainKey);
    
    // Decrypt with wrong key should fail
    process.env.AI_ENCRYPTION_KEY = 'wrong-key';
    expect(() => decrypt(encrypted)).toThrow();
  });

  it('should use AES-256-GCM for encryption', () => {
    const plainKey = 'sk-test-key-12345';
    const encrypted = encrypt(plainKey);
    const parts = encrypted.split(':');
    
    // Should have 3 parts: IV (32 hex chars = 16 bytes), authTag (32 hex chars = 16 bytes), encrypted data
    expect(parts).toHaveLength(3);
    expect(parts[0].length).toBe(32); // IV: 16 bytes = 32 hex chars
    expect(parts[1].length).toBe(32); // Auth tag: 16 bytes = 32 hex chars
  });

  it('should prevent tampering with encrypted data', () => {
    const plainKey = 'sk-test-key-12345';
    const encrypted = encrypt(plainKey);
    const parts = encrypted.split(':');
    
    // Tamper with the encrypted data
    const tampered = `${parts[0]}:${parts[1]}:${parts[2].slice(0, -1)}X`;
    
    // Should throw error due to authentication tag mismatch
    expect(() => decrypt(tampered)).toThrow();
  });

  it('should prevent tampering with authentication tag', () => {
    const plainKey = 'sk-test-key-12345';
    const encrypted = encrypt(plainKey);
    const parts = encrypted.split(':');
    
    // Tamper with the auth tag by changing a character
    const tamperedTag = parts[1].split('').map((char, i) => i === 0 ? (parseInt(char, 16) + 1).toString(16) : char).join('');
    const tampered = `${parts[0]}:${tamperedTag}:${parts[2]}`;
    
    // Should throw error due to authentication tag mismatch
    expect(() => decrypt(tampered)).toThrow();
  });

  it('should ensure only authorized components can access decrypted keys', () => {
    const plainKey = 'sk-test-key-12345';
    const encrypted = encrypt(plainKey);
    
    // Only components with access to AI_ENCRYPTION_KEY can decrypt
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plainKey);
    
    // Without the key, decryption should fail
    delete process.env.AI_ENCRYPTION_KEY;
    expect(() => decrypt(encrypted)).toThrow('AI_ENCRYPTION_KEY environment variable is not set');
  });

  it('should maintain encryption key confidentiality', () => {
    const encryptionKey = process.env.AI_ENCRYPTION_KEY;
    const plainKey = 'sk-test-key-12345';
    const encrypted = encrypt(plainKey);
    
    // Encrypted data should not reveal the encryption key
    expect(encrypted).not.toContain(encryptionKey);
    
    // Even with the encrypted API key, you cannot derive the encryption key
    const parts = encrypted.split(':');
    expect(parts[0]).not.toContain(encryptionKey);
    expect(parts[1]).not.toContain(encryptionKey);
    expect(parts[2]).not.toContain(encryptionKey);
  });
});
