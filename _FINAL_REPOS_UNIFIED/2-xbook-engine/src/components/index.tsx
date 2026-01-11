/**
 * XBook Engine - React Components
 * @package @mrf103/xbook-engine
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { XBookEngine, createXBookEngine } from '../core';
import type { XBookEngineConfig, Book, BookGenre } from '../types';

// =============================================================================
// Context
// =============================================================================

interface XBookContextValue {
  engine: XBookEngine | null;
  isInitialized: boolean;
  initialize: (config: XBookEngineConfig) => void;
}

const XBookContext = createContext<XBookContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface XBookProviderProps {
  children: ReactNode;
  config?: XBookEngineConfig;
}

export function XBookProvider({ children, config }: XBookProviderProps) {
  const [engine, setEngine] = useState<XBookEngine | null>(() => 
    config ? createXBookEngine(config) : null
  );
  const [isInitialized, setIsInitialized] = useState(!!config);

  const initialize = useCallback((newConfig: XBookEngineConfig) => {
    const newEngine = createXBookEngine(newConfig);
    setEngine(newEngine);
    setIsInitialized(true);
  }, []);

  return (
    <XBookContext.Provider value={{ engine, isInitialized, initialize }}>
      {children}
    </XBookContext.Provider>
  );
}

// =============================================================================
// Hook to use context
// =============================================================================

export function useXBookContext() {
  const context = useContext(XBookContext);
  if (!context) {
    throw new Error('useXBookContext must be used within XBookProvider');
  }
  return context;
}

// =============================================================================
// Book Card Component
// =============================================================================

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function BookCard({ book, onClick, onDelete, className = '' }: BookCardProps) {
  const statusColors: Record<string, string> = {
    draft: '#6B7280',
    generating: '#F59E0B',
    review: '#8B5CF6',
    editing: '#3B82F6',
    published: '#10B981',
    archived: '#9CA3AF',
  };

  return (
    <div 
      className={`xbook-card ${className}`}
      onClick={onClick}
      style={{
        padding: '1.5rem',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: 600,
            color: '#FFFFFF' 
          }}>
            {book.title}
          </h3>
          <p style={{ 
            margin: '0.25rem 0 0', 
            fontSize: '0.875rem', 
            color: 'rgba(255, 255, 255, 0.6)' 
          }}>
            by {book.author}
          </p>
        </div>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          background: `${statusColors[book.status]}20`,
          color: statusColors[book.status],
          textTransform: 'capitalize',
        }}>
          {book.status}
        </span>
      </div>
      
      <p style={{ 
        margin: '1rem 0', 
        fontSize: '0.875rem', 
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 1.6,
      }}>
        {book.description || 'No description'}
      </p>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        fontSize: '0.75rem', 
        color: 'rgba(255, 255, 255, 0.5)' 
      }}>
        <span>📚 {book.chapters.length} chapters</span>
        <span>📝 {book.metadata.wordCount.toLocaleString()} words</span>
        <span>⏱️ {book.metadata.readingTime} min read</span>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            color: '#DC2626',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
}

// =============================================================================
// Generation Progress Component
// =============================================================================

interface GenerationProgressProps {
  progress: number;
  status?: string;
  className?: string;
}

export function GenerationProgress({ progress, status, className = '' }: GenerationProgressProps) {
  return (
    <div className={`xbook-progress ${className}`} style={{ width: '100%' }}>
      {status && (
        <p style={{ 
          margin: '0 0 0.5rem', 
          fontSize: '0.875rem', 
          color: 'rgba(255, 255, 255, 0.7)' 
        }}>
          {status}
        </p>
      )}
      <div style={{
        width: '100%',
        height: '8px',
        borderRadius: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #0080FF, #8B4FFF)',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <p style={{ 
        margin: '0.5rem 0 0', 
        fontSize: '0.75rem', 
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'right',
      }}>
        {progress}%
      </p>
    </div>
  );
}

// =============================================================================
// Genre Selector Component
// =============================================================================

interface GenreSelectorProps {
  value: BookGenre | null;
  onChange: (genre: BookGenre) => void;
  className?: string;
}

const GENRES: { value: BookGenre; label: string; emoji: string }[] = [
  { value: 'fiction', label: 'Fiction', emoji: '📖' },
  { value: 'non-fiction', label: 'Non-Fiction', emoji: '📚' },
  { value: 'science-fiction', label: 'Sci-Fi', emoji: '🚀' },
  { value: 'fantasy', label: 'Fantasy', emoji: '🧙' },
  { value: 'mystery', label: 'Mystery', emoji: '🔍' },
  { value: 'romance', label: 'Romance', emoji: '💕' },
  { value: 'thriller', label: 'Thriller', emoji: '😱' },
  { value: 'horror', label: 'Horror', emoji: '👻' },
  { value: 'biography', label: 'Biography', emoji: '👤' },
  { value: 'self-help', label: 'Self-Help', emoji: '🌟' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'technical', label: 'Technical', emoji: '💻' },
];

export function GenreSelector({ value, onChange, className = '' }: GenreSelectorProps) {
  return (
    <div className={`xbook-genre-selector ${className}`} style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '0.5rem',
    }}>
      {GENRES.map((genre) => (
        <button
          key={genre.value}
          onClick={() => onChange(genre.value)}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            background: value === genre.value 
              ? 'linear-gradient(135deg, #0080FF, #8B4FFF)' 
              : 'rgba(255, 255, 255, 0.05)',
            border: value === genre.value 
              ? 'none' 
              : '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{genre.emoji}</span>
          <span>{genre.label}</span>
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// Word Count Display Component
// =============================================================================

interface WordCountDisplayProps {
  words: number;
  target?: number;
  className?: string;
}

export function WordCountDisplay({ words, target, className = '' }: WordCountDisplayProps) {
  const percentage = target ? Math.min((words / target) * 100, 100) : 0;
  
  return (
    <div className={`xbook-word-count ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '0.25rem' 
        }}>
          <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Words
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
            {words.toLocaleString()}
            {target && ` / ${target.toLocaleString()}`}
          </span>
        </div>
        {target && (
          <div style={{
            width: '100%',
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              borderRadius: '2px',
              background: percentage >= 100 ? '#10B981' : '#0080FF',
              transition: 'width 0.3s ease',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}
