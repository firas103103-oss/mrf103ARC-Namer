/**
 * XBook Engine - Core Tests
 * @package @mrf103/xbook-engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createXBookEngine, XBookEngine } from '../src/core';
import type { XBookEngineConfig } from '../src/types';

describe('XBookEngine', () => {
  let engine: XBookEngine;
  const testConfig: XBookEngineConfig = {
    ai: {
      openai: {
        apiKey: 'test-key',
        model: 'gpt-4-turbo',
      },
    },
    logging: {
      level: 'error', // Suppress logs during tests
    },
  };

  beforeEach(() => {
    engine = createXBookEngine(testConfig);
  });

  describe('Initialization', () => {
    it('should create an engine instance', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(XBookEngine);
    });

    it('should detect the active provider', () => {
      expect(engine.getProvider()).toBe('openai');
    });

    it('should return config', () => {
      const config = engine.getConfig();
      expect(config.ai.openai?.apiKey).toBe('test-key');
    });
  });

  describe('Book Management', () => {
    it('should create a new book', async () => {
      const book = await engine.createBook({
        title: 'Test Book',
        author: 'Test Author',
        genre: 'fiction',
        description: 'A test book',
      });

      expect(book).toBeDefined();
      expect(book.id).toMatch(/^xbook_/);
      expect(book.title).toBe('Test Book');
      expect(book.author).toBe('Test Author');
      expect(book.genre).toBe('fiction');
      expect(book.status).toBe('draft');
    });

    it('should get a book by id', async () => {
      const created = await engine.createBook({
        title: 'Get Test',
        author: 'Author',
        genre: 'non-fiction',
      });

      const retrieved = await engine.getBook(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent book', async () => {
      const book = await engine.getBook('non-existent-id');
      expect(book).toBeUndefined();
    });

    it('should update a book', async () => {
      const book = await engine.createBook({
        title: 'Original Title',
        author: 'Author',
        genre: 'fiction',
      });

      const updated = await engine.updateBook(book.id, {
        title: 'Updated Title',
        status: 'review',
      });

      expect(updated?.title).toBe('Updated Title');
      expect(updated?.status).toBe('review');
      expect(updated?.updatedAt).not.toEqual(book.updatedAt);
    });

    it('should delete a book', async () => {
      const book = await engine.createBook({
        title: 'Delete Me',
        author: 'Author',
        genre: 'fiction',
      });

      const deleted = await engine.deleteBook(book.id);
      expect(deleted).toBe(true);

      const retrieved = await engine.getBook(book.id);
      expect(retrieved).toBeUndefined();
    });

    it('should list all books', async () => {
      await engine.createBook({ title: 'Book 1', author: 'A', genre: 'fiction' });
      await engine.createBook({ title: 'Book 2', author: 'B', genre: 'fantasy' });
      await engine.createBook({ title: 'Book 3', author: 'C', genre: 'mystery' });

      const books = await engine.listBooks();
      expect(books.length).toBe(3);
    });
  });

  describe('Content Generation', () => {
    it('should generate an outline', async () => {
      const result = await engine.generateOutline({
        title: 'The Great Adventure',
        genre: 'fantasy',
        chapterCount: 10,
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.metadata?.model).toBe('gpt-4-turbo');
    });

    it('should generate a chapter', async () => {
      const book = await engine.createBook({
        title: 'Test Novel',
        author: 'Writer',
        genre: 'science-fiction',
      });

      const result = await engine.generateChapter({
        bookId: book.id,
        chapterNumber: 1,
        chapterTitle: 'The Beginning',
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
    });

    it('should fail for non-existent book', async () => {
      const result = await engine.generateChapter({
        bookId: 'fake-id',
        chapterNumber: 1,
        chapterTitle: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('BOOK_NOT_FOUND');
    });
  });

  describe('Event System', () => {
    it('should emit book:created event', async () => {
      let emittedBook: unknown = null;

      engine.on('book:created', (payload) => {
        emittedBook = payload.data;
      });

      const book = await engine.createBook({
        title: 'Event Test',
        author: 'Author',
        genre: 'thriller',
      });

      expect(emittedBook).toBeDefined();
      expect((emittedBook as { id: string }).id).toBe(book.id);
    });

    it('should unsubscribe from events', async () => {
      let callCount = 0;

      const unsubscribe = engine.on('book:created', () => {
        callCount++;
      });

      await engine.createBook({ title: 'Test 1', author: 'A', genre: 'fiction' });
      expect(callCount).toBe(1);

      unsubscribe();

      await engine.createBook({ title: 'Test 2', author: 'B', genre: 'fiction' });
      expect(callCount).toBe(1); // Still 1, not called again
    });
  });

  describe('Provider Switching', () => {
    it('should switch providers', () => {
      expect(engine.getProvider()).toBe('openai');
      
      engine.setProvider('anthropic');
      expect(engine.getProvider()).toBe('anthropic');
    });
  });
});
