import { QueryClient, QueryFunction, QueryCache } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export type ErrorType = "network" | "server" | "auth" | "client" | "unknown";

export interface ApiError extends Error {
  status?: number;
  errorType: ErrorType;
}

export function classifyError(error: unknown): ErrorType {
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("Failed to fetch") || message.includes("NetworkError") || message.includes("network")) {
      return "network";
    }
    const statusMatch = message.match(/^(\d{3}):/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      if (status === 401 || status === 403) return "auth";
      if (status >= 500) return "server";
      if (status >= 400) return "client";
    }
  }
  return "unknown";
}

export function getErrorMessage(error: unknown): string {
  const errorType = classifyError(error);
  switch (errorType) {
    case "network":
      return "Connection lost. Please check your internet.";
    case "server":
      return "Server error. Please try again.";
    case "auth":
      return "Session expired. Please log in again.";
    case "client":
      return error instanceof Error ? error.message : "Request failed.";
    default:
      return error instanceof Error ? error.message : "An unexpected error occurred.";
  }
}

interface FetchWithRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  retryOn5xx?: boolean;
  retryOnNetwork?: boolean;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    retryOn5xx = true,
    retryOnNetwork = true,
  } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }

      if (response.status >= 400 && response.status < 500) {
        const text = (await response.text()) || response.statusText;
        const error = new Error(`${response.status}: ${text}`) as ApiError;
        error.status = response.status;
        error.errorType = response.status === 401 || response.status === 403 ? "auth" : "client";
        throw error;
      }

      if (response.status >= 500 && retryOn5xx && attempt < maxRetries) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        await delay(delayMs);
        continue;
      }

      const text = (await response.text()) || response.statusText;
      const error = new Error(`${response.status}: ${text}`) as ApiError;
      error.status = response.status;
      error.errorType = "server";
      throw error;
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      const isNetworkError = 
        error instanceof TypeError || 
        (error instanceof Error && (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError") ||
          error.message.includes("network")
        ));

      if (isNetworkError && retryOnNetwork && attempt < maxRetries) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const delayMs = baseDelay * Math.pow(2, attempt);
        await delay(delayMs);
        continue;
      }

      if (isNetworkError) {
        const networkError = new Error("Connection lost. Please check your internet.") as ApiError;
        networkError.errorType = "network";
        throw networkError;
      }

      throw error;
    }
  }

  if (lastError) {
    const error = new Error("Connection lost. Please check your internet.") as ApiError;
    error.errorType = "network";
    throw error;
  }

  throw new Error("Request failed after retries");
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export async function apiRequestWithRetry(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  return fetchWithRetry(
    url,
    {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    },
    { maxRetries: 3, baseDelay: 1000 }
  );
}

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) return false;
  
  const errorType = classifyError(error);
  if (errorType === "auth" || errorType === "client") return false;
  
  return errorType === "network" || errorType === "server";
}

function getRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * Math.pow(2, attemptIndex), 8000);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show error toasts for active queries with existing data
      if (query.state.data !== undefined) {
        const message = getErrorMessage(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: shouldRetry,
      retryDelay: getRetryDelay,
    },
    mutations: {
      retry: false,
    },
  },
});
