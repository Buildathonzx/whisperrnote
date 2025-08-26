import { GeminiError } from './types';

export class GeminiRetryError extends Error {
  constructor(public attempts: number, public lastError: GeminiError) {
    super(`Failed after ${attempts} attempts: ${lastError.message}`);
    this.name = 'GeminiRetryError';
  }
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['RATE_LIMITED', 'QUOTA_EXCEEDED', 'API_ERROR'],
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: GeminiError | null = null;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as GeminiError;

      // Don't retry on the last attempt
      if (attempt === finalConfig.maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(lastError, finalConfig.retryableErrors)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
        finalConfig.maxDelay
      );

      console.warn(`Gemini API request failed (attempt ${attempt + 1}/${finalConfig.maxRetries + 1}): ${lastError.message}. Retrying in ${delay}ms...`);
      
      await sleep(delay);
    }
  }

  throw new GeminiRetryError(finalConfig.maxRetries + 1, lastError!);
}

function isRetryableError(error: GeminiError, retryableErrors: string[]): boolean {
  return retryableErrors.includes(error.code);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class GeminiErrorHandler {
  static handle(error: unknown): GeminiError {
    if (error instanceof Error) {
      // Map common API errors
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('Invalid API key')) {
        return {
          code: 'INVALID_API_KEY',
          message: 'Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.',
          details: error,
        };
      }

      if (error.message.includes('quota exceeded') || error.message.includes('Quota exceeded')) {
        return {
          code: 'QUOTA_EXCEEDED',
          message: 'Gemini API quota exceeded. Please try again later or upgrade your plan.',
          details: error,
        };
      }

      if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        return {
          code: 'RATE_LIMITED',
          message: 'Gemini API rate limit exceeded. Please wait before making another request.',
          details: error,
        };
      }

      if (error.message.includes('safety') || error.message.includes('Safety')) {
        return {
          code: 'SAFETY_FILTER',
          message: 'Content blocked by Gemini safety filters. Please modify your request.',
          details: error,
        };
      }

      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return {
          code: 'TIMEOUT',
          message: 'Request timed out. Please try again.',
          details: error,
        };
      }

      if (error.message.includes('network') || error.message.includes('Network')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your internet connection and try again.',
          details: error,
        };
      }

      return {
        code: 'API_ERROR',
        message: error.message,
        details: error,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error,
    };
  }

  static isRetryable(error: GeminiError): boolean {
    return DEFAULT_RETRY_CONFIG.retryableErrors.includes(error.code);
  }

  static getErrorMessage(error: GeminiError): string {
    switch (error.code) {
      case 'INVALID_API_KEY':
        return 'Please check your Gemini API key configuration.';
      case 'QUOTA_EXCEEDED':
        return 'API quota exceeded. Please try again later.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment before trying again.';
      case 'SAFETY_FILTER':
        return 'Content was blocked by safety filters. Please modify your request.';
      case 'TIMEOUT':
        return 'Request timed out. Please try again.';
      case 'NETWORK_ERROR':
        return 'Network connection issue. Please check your internet connection.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
}

// Helper function to create user-friendly error messages
export function createUserFriendlyErrorMessage(error: unknown): string {
  const geminiError = GeminiErrorHandler.handle(error);
  return GeminiErrorHandler.getErrorMessage(geminiError);
}