/**
 * useLocalStorage Hook - حفظ واسترجاع التقدم من localStorage
 * MrF X OS Organization - X-Book System
 */

import { useState, useEffect } from 'react';
import { ProcessingProgress } from '../types';

const STORAGE_KEY = 'xbook_progress';

export function useLocalStorage() {
  /**
   * حفظ التقدم
   */
  const saveProgress = (progress: ProcessingProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      console.log('Progress saved to localStorage');
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  };

  /**
   * استرجاع التقدم
   */
  const loadProgress = (): ProcessingProgress | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress = JSON.parse(saved);
        console.log('Progress loaded from localStorage');
        return progress;
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
    return null;
  };

  /**
   * مسح التقدم
   */
  const clearProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Progress cleared from localStorage');
    } catch (e) {
      console.error('Failed to clear progress:', e);
    }
  };

  /**
   * التحقق من وجود تقدم محفوظ
   */
  const hasProgress = (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (e) {
      return false;
    }
  };

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    hasProgress
  };
}

/**
 * Hook للحفظ التلقائي
 */
export function useAutoSave<T>(
  data: T,
  key: string,
  options: {
    delay?: number;
    enabled?: boolean;
  } = {}
) {
  const { delay = 2000, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`✅ Auto-saved: ${key}`);
      } catch (e) {
        console.error('❌ Auto-save failed:', e);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [data, key, delay, enabled]);
}

/**
 * Hook لاسترجاع البيانات المحفوظة
 */
export function useAutoRestore<T>(key: string, defaultValue: T): T {
  const [value] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        console.log(`✅ Restored from storage: ${key}`);
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('❌ Restore failed:', error);
    }
    return defaultValue;
  });

  return value;
}
