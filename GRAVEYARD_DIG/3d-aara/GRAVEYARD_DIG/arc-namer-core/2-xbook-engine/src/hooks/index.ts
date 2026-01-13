/**
 * XBook Engine - React Hooks
 * @package @mrf103/xbook-engine
 */

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import type { 
  XBookEngine 
} from '../core';
import type {
  Book,
  BookGenre,
  GenerationResult,
  XBookEvent,
} from '../types';

// =============================================================================
// Hook Types
// =============================================================================

interface UseXBookEngineOptions {
  autoConnect?: boolean;
}

interface UseBookGenerationOptions {
  onProgress?: (progress: number) => void;
  onComplete?: (result: GenerationResult) => void;
  onError?: (error: Error) => void;
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  result: GenerationResult | null;
  error: Error | null;
}

// =============================================================================
// useXBookEngine Hook
// =============================================================================

export function useXBookEngine(
  engine: XBookEngine | null,
  _options: UseXBookEngineOptions = {}
) {
  const [isReady, setIsReady] = useState(false);
  const [provider, setProvider] = useState(engine?.getProvider() || null);

  useEffect(() => {
    if (engine) {
      setIsReady(true);
      setProvider(engine.getProvider());
    }
  }, [engine]);

  const switchProvider = useCallback((newProvider: 'openai' | 'anthropic' | 'google') => {
    if (engine) {
      engine.setProvider(newProvider);
      setProvider(newProvider);
    }
  }, [engine]);

  return {
    engine,
    isReady,
    provider,
    switchProvider,
  };
}

// =============================================================================
// useBooks Hook
// =============================================================================

export function useBooks(engine: XBookEngine | null) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!engine) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const bookList = await engine.listBooks();
      setBooks(bookList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch books'));
    } finally {
      setIsLoading(false);
    }
  }, [engine]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to book events
  useEffect(() => {
    if (!engine) return;

    const events: XBookEvent[] = ['book:created', 'book:updated', 'book:deleted'];
    const unsubscribers = events.map(event => 
      engine.on(event, () => refresh())
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [engine, refresh]);

  const createBook = useCallback(async (params: {
    title: string;
    author: string;
    genre: BookGenre;
    description?: string;
  }) => {
    if (!engine) throw new Error('Engine not initialized');
    
    const book = await engine.createBook(params);
    return book;
  }, [engine]);

  const deleteBook = useCallback(async (id: string) => {
    if (!engine) throw new Error('Engine not initialized');
    
    return engine.deleteBook(id);
  }, [engine]);

  return {
    books,
    isLoading,
    error,
    refresh,
    createBook,
    deleteBook,
  };
}

// =============================================================================
// useBook Hook (Single Book)
// =============================================================================

export function useBook(engine: XBookEngine | null, bookId: string | null) {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!engine || !bookId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await engine.getBook(bookId);
      setBook(result || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch book'));
    } finally {
      setIsLoading(false);
    }
  }, [engine, bookId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const update = useCallback(async (updates: Partial<Book>) => {
    if (!engine || !bookId) throw new Error('Engine or book ID not available');
    
    const updated = await engine.updateBook(bookId, updates);
    if (updated) {
      setBook(updated);
    }
    return updated;
  }, [engine, bookId]);

  return {
    book,
    isLoading,
    error,
    refresh: fetch,
    update,
  };
}

// =============================================================================
// useGeneration Hook
// =============================================================================

export function useGeneration(
  engine: XBookEngine | null,
  options: UseBookGenerationOptions = {}
) {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    result: null,
    error: null,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Subscribe to generation events
  useEffect(() => {
    if (!engine) return;

    const unsubProgress = engine.on('generation:progress', (payload) => {
      const progress = (payload.data as { progress?: number })?.progress || 0;
      setState(prev => ({ ...prev, progress }));
      optionsRef.current.onProgress?.(progress);
    });

    const unsubComplete = engine.on('generation:complete', (payload) => {
      const result = payload.data as GenerationResult;
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        progress: 100, 
        result 
      }));
      optionsRef.current.onComplete?.(result);
    });

    const unsubError = engine.on('generation:error', (payload) => {
      const errorData = payload.data as GenerationResult;
      const error = new Error(errorData.error?.message || 'Generation failed');
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error 
      }));
      optionsRef.current.onError?.(error);
    });

    return () => {
      unsubProgress();
      unsubComplete();
      unsubError();
    };
  }, [engine]);

  const generateOutline = useCallback(async (params: {
    title: string;
    genre: BookGenre;
    chapterCount?: number;
    description?: string;
  }) => {
    if (!engine) throw new Error('Engine not initialized');

    setState({
      isGenerating: true,
      progress: 0,
      result: null,
      error: null,
    });

    return engine.generateOutline(params);
  }, [engine]);

  const generateChapter = useCallback(async (params: {
    bookId: string;
    chapterNumber: number;
    chapterTitle: string;
    outline?: string;
  }) => {
    if (!engine) throw new Error('Engine not initialized');

    setState({
      isGenerating: true,
      progress: 0,
      result: null,
      error: null,
    });

    return engine.generateChapter(params);
  }, [engine]);

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      result: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    generateOutline,
    generateChapter,
    reset,
  };
}

// =============================================================================
// useXBookEvent Hook
// =============================================================================

export function useXBookEvent<T = unknown>(
  engine: XBookEngine | null,
  event: XBookEvent,
  handler: (data: T) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!engine) return;

    const unsubscribe = engine.on(event, (payload) => {
      handlerRef.current(payload.data as T);
    });

    return unsubscribe;
  }, [engine, event]);
}

// =============================================================================
// useWordCount Hook
// =============================================================================

export function useWordCount(text: string) {
  return useMemo(() => {
    if (!text) return { words: 0, characters: 0, readingTime: 0 };
    
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    
    return { words, characters, readingTime };
  }, [text]);
}
