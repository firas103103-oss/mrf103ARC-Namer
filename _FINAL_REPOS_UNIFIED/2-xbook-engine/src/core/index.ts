/**
 * XBook Engine - Core Engine
 * @package @mrf103/xbook-engine
 */

import type {
  AIProvider,
  Book,
  BookGenre,
  GenerationRequest,
  GenerationResult,
  XBookEngineConfig,
  XBookEvent,
  XBookEventHandler,
  XBookEventPayload,
} from '../types';

// =============================================================================
// XBook Engine Class
// =============================================================================

export class XBookEngine {
  private config: XBookEngineConfig;
  private eventHandlers: Map<XBookEvent, Set<XBookEventHandler>>;
  private books: Map<string, Book>;
  private activeProvider: AIProvider | null = null;

  constructor(config: XBookEngineConfig) {
    this.config = config;
    this.eventHandlers = new Map();
    this.books = new Map();
    this.initializeProvider();
  }

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------

  private initializeProvider(): void {
    const { ai } = this.config;
    
    if (ai.openai?.apiKey) {
      this.activeProvider = 'openai';
    } else if (ai.anthropic?.apiKey) {
      this.activeProvider = 'anthropic';
    } else if (ai.google?.apiKey) {
      this.activeProvider = 'google';
    }
    
    this.log('info', `XBook Engine initialized with provider: ${this.activeProvider || 'none'}`);
  }

  // ---------------------------------------------------------------------------
  // Book Management
  // ---------------------------------------------------------------------------

  async createBook(params: {
    title: string;
    author: string;
    genre: BookGenre;
    description?: string;
  }): Promise<Book> {
    const book: Book = {
      id: this.generateId(),
      title: params.title,
      author: params.author,
      genre: params.genre,
      description: params.description || '',
      language: 'en',
      chapters: [],
      metadata: {
        wordCount: 0,
        readingTime: 0,
        keywords: [],
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.books.set(book.id, book);
    await this.emit('book:created', book);
    
    return book;
  }

  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;

    const updatedBook: Book = {
      ...book,
      ...updates,
      updatedAt: new Date(),
    };

    this.books.set(id, updatedBook);
    await this.emit('book:updated', updatedBook);
    
    return updatedBook;
  }

  async deleteBook(id: string): Promise<boolean> {
    const deleted = this.books.delete(id);
    if (deleted) {
      await this.emit('book:deleted', { id });
    }
    return deleted;
  }

  async listBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  // ---------------------------------------------------------------------------
  // Content Generation
  // ---------------------------------------------------------------------------

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    if (!this.activeProvider) {
      return {
        success: false,
        error: {
          code: 'NO_PROVIDER',
          message: 'No AI provider configured',
        },
      };
    }

    await this.emit('generation:start', { request });
    const startTime = Date.now();

    try {
      const result = await this.callAIProvider(request);
      const generationTime = Date.now() - startTime;

      const successResult: GenerationResult = {
        success: true,
        content: result.content,
        metadata: {
          tokensUsed: result.tokensUsed,
          generationTime,
          model: result.model,
          finishReason: result.finishReason,
        },
      };

      await this.emit('generation:complete', successResult);
      return successResult;
    } catch (error) {
      const errorResult: GenerationResult = {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };

      await this.emit('generation:error', errorResult);
      return errorResult;
    }
  }

  async generateOutline(params: {
    title: string;
    genre: BookGenre;
    chapterCount?: number;
    description?: string;
  }): Promise<GenerationResult> {
    const prompt = this.buildOutlinePrompt(params);
    return this.generate({
      type: 'outline',
      prompt,
      context: { genre: params.genre },
    });
  }

  async generateChapter(params: {
    bookId: string;
    chapterNumber: number;
    chapterTitle: string;
    outline?: string;
  }): Promise<GenerationResult> {
    const book = await this.getBook(params.bookId);
    if (!book) {
      return {
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: `Book with ID ${params.bookId} not found`,
        },
      };
    }

    const prompt = this.buildChapterPrompt(book, params);
    return this.generate({
      type: 'chapter',
      prompt,
      context: {
        genre: book.genre,
        previousContent: this.getPreviousChapterSummary(book, params.chapterNumber),
      },
    });
  }

  // ---------------------------------------------------------------------------
  // AI Provider Integration
  // ---------------------------------------------------------------------------

  private async callAIProvider(request: GenerationRequest): Promise<{
    content: string;
    tokensUsed: number;
    model: string;
    finishReason: string;
  }> {
    // This is a placeholder - actual implementation would call the AI APIs
    const model = this.getActiveModel();
    
    // Simulate API call
    await this.delay(100);

    return {
      content: `[Generated content for: ${request.type}]\n\n${request.prompt}`,
      tokensUsed: Math.floor(request.prompt.length / 4),
      model,
      finishReason: 'complete',
    };
  }

  private getActiveModel(): string {
    const { ai } = this.config;
    
    switch (this.activeProvider) {
      case 'openai':
        return ai.openai?.model || 'gpt-4-turbo';
      case 'anthropic':
        return ai.anthropic?.model || 'claude-3-opus';
      case 'google':
        return ai.google?.model || 'gemini-pro';
      default:
        return 'unknown';
    }
  }

  // ---------------------------------------------------------------------------
  // Prompt Building
  // ---------------------------------------------------------------------------

  private buildOutlinePrompt(params: {
    title: string;
    genre: BookGenre;
    chapterCount?: number;
    description?: string;
  }): string {
    const chapterCount = params.chapterCount || 12;
    
    return `Create a detailed book outline for:
Title: "${params.title}"
Genre: ${params.genre}
Chapters: ${chapterCount}
${params.description ? `Description: ${params.description}` : ''}

Please provide:
1. A compelling synopsis
2. Chapter-by-chapter breakdown with titles and summaries
3. Key plot points and character arcs
4. Thematic elements`;
  }

  private buildChapterPrompt(book: Book, params: {
    chapterNumber: number;
    chapterTitle: string;
    outline?: string;
  }): string {
    return `Write Chapter ${params.chapterNumber}: "${params.chapterTitle}"

Book: "${book.title}" by ${book.author}
Genre: ${book.genre}
${params.outline ? `Chapter Outline: ${params.outline}` : ''}

Write engaging, well-paced content that advances the story while maintaining the established tone and style.`;
  }

  private getPreviousChapterSummary(book: Book, currentChapter: number): string {
    if (currentChapter <= 1 || book.chapters.length === 0) {
      return '';
    }

    const previousChapters = book.chapters
      .filter(ch => ch.number < currentChapter)
      .sort((a, b) => a.number - b.number)
      .slice(-2);

    if (previousChapters.length === 0) return '';

    return previousChapters
      .map(ch => `Chapter ${ch.number}: ${ch.title}`)
      .join('\n');
  }

  // ---------------------------------------------------------------------------
  // Event System
  // ---------------------------------------------------------------------------

  on<T = unknown>(event: XBookEvent, handler: XBookEventHandler<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler as XBookEventHandler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as XBookEventHandler);
    };
  }

  private async emit<T = unknown>(event: XBookEvent, data: T): Promise<void> {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    const payload: XBookEventPayload<T> = {
      event,
      timestamp: new Date(),
      data,
    };

    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (error) {
        this.log('error', `Event handler error for ${event}:`, error);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  private generateId(): string {
    return `xbook_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', ...args: unknown[]): void {
    const configLevel = this.config.logging?.level || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    
    if (levels.indexOf(level) >= levels.indexOf(configLevel)) {
      console[level]('[XBook]', ...args);
    }
  }

  // ---------------------------------------------------------------------------
  // Public Utilities
  // ---------------------------------------------------------------------------

  getProvider(): AIProvider | null {
    return this.activeProvider;
  }

  setProvider(provider: AIProvider): void {
    this.activeProvider = provider;
    this.log('info', `Provider changed to: ${provider}`);
  }

  getConfig(): XBookEngineConfig {
    return { ...this.config };
  }
}

// =============================================================================
// Factory Function
// =============================================================================

export function createXBookEngine(config: XBookEngineConfig): XBookEngine {
  return new XBookEngine(config);
}

// =============================================================================
// Exports
// =============================================================================

export * from '../types';
