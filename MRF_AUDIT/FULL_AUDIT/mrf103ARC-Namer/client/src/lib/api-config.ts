/**
 * API Configuration Manager
 * Handles base URL resolution for different platforms and environments
 */

declare global {
  interface Window {
    Capacitor?: {
      getPlatform: () => 'ios' | 'android' | 'web';
      isNativePlatform: () => boolean;
    };
  }
}

/**
 * Get the API base URL based on platform and environment
 */
export function getApiBaseUrl(): string {
  // Check if running in Capacitor (native mobile app)
  const isNative = window.Capacitor?.isNativePlatform?.() || false;
  
  if (isNative) {
    // In APK/native app, always use the configured API URL
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      console.error('❌ VITE_API_URL not configured! APK will not work.');
      return 'https://mrf103arc-namer-production-236c.up.railway.app';  // Fallback
    }
    
    return apiUrl;
  }
  
  // In web browser, use relative URLs (same origin)
  return '';
}

/**
 * Get full API endpoint URL
 */
export function getApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * App configuration
 */
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'ARC Operator',
  version: import.meta.env.VITE_APP_VERSION || '2.0.0',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiBaseUrl: getApiBaseUrl(),
};

/**
 * Enhanced fetch wrapper with automatic URL resolution
 */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(path);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',  // Important for session cookies
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Log configuration on app start
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    environment: APP_CONFIG.environment,
    version: APP_CONFIG.version,
    baseUrl: APP_CONFIG.apiBaseUrl,
    platform: window.Capacitor?.getPlatform() || 'web',
    isNative: window.Capacitor?.isNativePlatform() || false,
  });
}

export default {
  getApiBaseUrl,
  getApiUrl,
  apiFetch,
  APP_CONFIG,
};
