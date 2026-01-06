import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Navigation guard hook to prevent navigation freezing
 * Handles edge cases and provides fallback navigation
 */
export function useNavigationGuard() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Prevent navigation loops
    const navigationTimeout = setTimeout(() => {
      // If stuck on auth page but should be elsewhere, redirect
      if (location === '/auth' && window.location.pathname !== '/auth') {
        console.warn('Navigation mismatch detected, syncing...');
        setLocation(window.location.pathname);
      }
    }, 100);

    return () => clearTimeout(navigationTimeout);
  }, [location, setLocation]);

  // Safe navigation wrapper with timeout
  const safeNavigate = (path: string, timeout = 5000) => {
    const navigationPromise = new Promise<void>((resolve) => {
      setLocation(path);
      resolve();
    });

    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Navigation timeout'));
      }, timeout);
    });

    return Promise.race([navigationPromise, timeoutPromise]).catch((error) => {
      console.error('Navigation failed, using fallback:', error);
      window.location.href = path;
    });
  };

  return { safeNavigate, currentLocation: location };
}
