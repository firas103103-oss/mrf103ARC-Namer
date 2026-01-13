export class RecoverableError extends Error {
  constructor(
    message: string,
    public recoverable: boolean = true,
    public retryable: boolean = true
  ) {
    super(message);
  }
}

export async function withErrorRecovery<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    onRetry?: (attempt: number, error: Error) => void;
    fallback?: () => T;
  } = {}
): Promise<T> {
  const { maxRetries = 3, onRetry, fallback } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Check if error is recoverable
      if (error instanceof RecoverableError && !error.retryable) {
        if (fallback) return fallback();
        throw error;
      }

      // Last attempt
      if (attempt === maxRetries) {
        if (fallback) return fallback();
        throw error;
      }

      // Notify and retry
      onRetry?.(attempt, error);
      await sleep(Math.pow(2, attempt - 1) * 1000);
    }
  }

  throw new Error('Max retries exceeded');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
