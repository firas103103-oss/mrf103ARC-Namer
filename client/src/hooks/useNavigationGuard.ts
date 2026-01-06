import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * Navigation guard hook - Fixed for proper routing sync
 * Prevents navigation loops and ensures consistent state
 */
export function useNavigationGuard() {
  const [location, setLocation] = useLocation();

  // Sync check - ensure wouter and browser location match
  useEffect(() => {
    const actualPath = window.location.pathname;
    if (location !== actualPath && actualPath !== '/') {
      console.log(`[Nav Guard] Syncing: ${location} -> ${actualPath}`);
      setLocation(actualPath);
    }
  }, [location, setLocation]);

  // Safe navigation with proper error handling
  const safeNavigate = useCallback((path: string) => {
    try {
      setLocation(path);
    } catch (error) {
      console.error('[Nav Guard] Navigation failed:', error);
      // Fallback to hard navigation
      window.location.href = path;
    }
  }, [setLocation]);

  return { safeNavigate, currentLocation: location };
}
