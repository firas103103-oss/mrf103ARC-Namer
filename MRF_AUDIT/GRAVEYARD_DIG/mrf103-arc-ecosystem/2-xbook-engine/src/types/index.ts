/**
 * XBook Engine - Core Types
 * @package @mrf103/xbook-engine
 */

// =============================================================================
// AI Provider Types
// =============================================================================

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'local';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface AIProviderConfig {
  openai?: {
    apiKey: string;
    model?: string;
    organization?: string;
  };
  anthropic?: {
    apiKey: string;
    model?: string;
  };
  google?: {
    apiKey: string;
    model?: string;
  };
}

// =============================================================================
// Book & Content Types
// =============================================================================

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  description: string;
  genre: BookGenre;
  language: string;
  chapters: Chapter[];
  metadata: BookMetadata;
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type BookGenre = 
  | 'fiction'
  | 'non-fiction'
  | 'science-fiction'
  | 'fantasy'
  | 'mystery'
  | 'romance'
  | 'thriller'
  | 'horror'
  | 'biography'
  | 'self-help'
  | 'business'
  | 'technical'
  | 'children'
  | 'young-adult'
  | 'poetry'
  | 'other';

export type BookStatus = 
  | 'draft'
  | 'generating'
  | 'review'
  | 'editing'
  | 'published'
  | 'archived';

export interface BookMetadata {
  isbn?: string;
  publisher?: string;
  publishDate?: Date;
  edition?: string;
  pages?: number;
  wordCount: number;
  readingTime: number; // in minutes
  targetAudience?: string;
  keywords: string[];
  coverImage?: string;
  copyright?: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  content: string;
  wordCount: number;
  sections: Section[];
  status: ChapterStatus;
  generatedAt?: Date;
}

export type ChapterStatus = 'pending' | 'generating' | 'complete' | 'error';

export interface Section {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  order: number;
}

// =============================================================================
// Generation Types
// =============================================================================

export interface GenerationRequest {
  type: 'book' | 'chapter' | 'section' | 'outline';
  prompt: string;
  context?: GenerationContext;
  style?: WritingStyle;
  options?: GenerationOptions;
}

export interface GenerationContext {
  genre?: BookGenre;
  tone?: string;
  targetAudience?: string;
  previousContent?: string;
  characters?: Character[];
  worldBuilding?: WorldBuilding;
}

export interface WritingStyle {
  voice: 'first-person' | 'second-person' | 'third-person-limited' | 'third-person-omniscient';
  tense: 'past' | 'present' | 'future';
  formality: 'casual' | 'neutral' | 'formal' | 'academic';
  complexity: 'simple' | 'moderate' | 'complex';
  descriptiveness: 'minimal' | 'balanced' | 'rich';
}

export interface GenerationOptions {
  maxLength?: number;
  minLength?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface GenerationResult {
  success: boolean;
  content?: string;
  metadata?: {
    tokensUsed: number;
    generationTime: number;
    model: string;
    finishReason: string;
  };
  error?: GenerationError;
}

export interface GenerationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// Character & World Building Types
// =============================================================================

export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  traits: string[];
  backstory?: string;
  relationships: CharacterRelationship[];
  arc?: string;
}

export interface CharacterRelationship {
  characterId: string;
  type: string;
  description?: string;
}

export interface WorldBuilding {
  setting: string;
  timePeriod: string;
  locations: Location[];
  rules?: string[];
  history?: string;
  culture?: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  significance?: string;
}

// =============================================================================
// Export Types
// =============================================================================

export type ExportFormat = 'pdf' | 'epub' | 'docx' | 'html' | 'markdown' | 'txt';

export interface ExportOptions {
  format: ExportFormat;
  includeTableOfContents?: boolean;
  includeCoverPage?: boolean;
  pageSize?: 'a4' | 'letter' | 'a5';
  fontSize?: number;
  fontFamily?: string;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerText?: string;
  footerText?: string;
  watermark?: string;
}

export interface ExportResult {
  success: boolean;
  buffer?: Buffer;
  filePath?: string;
  mimeType?: string;
  error?: string;
}

// =============================================================================
// Engine Configuration
// =============================================================================

export interface XBookEngineConfig {
  ai: AIProviderConfig;
  defaults?: {
    genre?: BookGenre;
    style?: Partial<WritingStyle>;
    exportFormat?: ExportFormat;
  };
  storage?: {
    type: 'memory' | 'file' | 'database';
    path?: string;
    connectionString?: string;
  };
  cache?: {
    enabled: boolean;
    ttl?: number;
    maxSize?: number;
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    destination?: 'console' | 'file';
    filePath?: string;
  };
}

// =============================================================================
// Event Types
// =============================================================================

export type XBookEvent = 
  | 'generation:start'
  | 'generation:progress'
  | 'generation:complete'
  | 'generation:error'
  | 'export:start'
  | 'export:complete'
  | 'export:error'
  | 'book:created'
  | 'book:updated'
  | 'book:deleted'
  | 'chapter:created'
  | 'chapter:updated';

export interface XBookEventPayload<T = unknown> {
  event: XBookEvent;
  timestamp: Date;
  data: T;
}

export type XBookEventHandler<T = unknown> = (payload: XBookEventPayload<T>) => void | Promise<void>;
