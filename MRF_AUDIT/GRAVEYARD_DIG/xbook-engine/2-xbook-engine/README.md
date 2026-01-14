# 📚 XBook Engine

**AI-Powered Content Generation & Book Publishing Engine**

[![npm version](https://img.shields.io/npm/v/@mrf103/xbook-engine)](https://www.npmjs.com/package/@mrf103/xbook-engine)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Overview

XBook Engine is a powerful, TypeScript-first library for AI-powered content generation and book publishing. Create complete books, generate chapters, manage content workflows, and export to multiple formats.

### ✨ Key Features

- 🤖 **Multi-AI Provider Support** - OpenAI, Anthropic, Google AI
- 📖 **Book Management** - Create, edit, and organize books and chapters
- ⚡ **Real-time Generation** - Stream content as it's generated
- 🎯 **React Hooks** - First-class React integration
- 📤 **Multi-format Export** - PDF, EPUB, DOCX, Markdown
- 🔧 **Fully Typed** - Complete TypeScript support

---

## 📦 Installation

```bash
# npm
npm install @mrf103/xbook-engine

# yarn
yarn add @mrf103/xbook-engine

# pnpm
pnpm add @mrf103/xbook-engine
```

---

## 🎯 Quick Start

### Basic Usage

```typescript
import { createXBookEngine } from '@mrf103/xbook-engine';

// Initialize the engine
const engine = createXBookEngine({
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo',
    },
  },
});

// Create a new book
const book = await engine.createBook({
  title: 'The Future of AI',
  author: 'John Doe',
  genre: 'non-fiction',
  description: 'An exploration of artificial intelligence',
});

// Generate an outline
const outline = await engine.generateOutline({
  title: book.title,
  genre: book.genre,
  chapterCount: 10,
});

console.log(outline.content);
```

### React Integration

```tsx
import { 
  XBookProvider, 
  useBooks, 
  useGeneration,
  BookCard 
} from '@mrf103/xbook-engine';

// Wrap your app with the provider
function App() {
  return (
    <XBookProvider config={{
      ai: {
        openai: { apiKey: 'your-api-key' }
      }
    }}>
      <BookList />
    </XBookProvider>
  );
}

// Use hooks in your components
function BookList() {
  const { books, isLoading, createBook } = useBooks(engine);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```

---

## 📖 API Reference

### Core Engine

#### `createXBookEngine(config)`

Creates a new XBook Engine instance.

```typescript
const engine = createXBookEngine({
  ai: {
    openai: { apiKey: 'sk-...', model: 'gpt-4-turbo' },
    anthropic: { apiKey: 'sk-ant-...', model: 'claude-3-opus' },
  },
  defaults: {
    genre: 'fiction',
  },
  logging: {
    level: 'info',
  },
});
```

#### Engine Methods

| Method | Description |
|--------|-------------|
| `createBook(params)` | Create a new book |
| `getBook(id)` | Get a book by ID |
| `updateBook(id, updates)` | Update a book |
| `deleteBook(id)` | Delete a book |
| `listBooks()` | List all books |
| `generateOutline(params)` | Generate a book outline |
| `generateChapter(params)` | Generate a chapter |

### React Hooks

| Hook | Description |
|------|-------------|
| `useXBookEngine(engine)` | Access engine state |
| `useBooks(engine)` | Manage book list |
| `useBook(engine, id)` | Single book operations |
| `useGeneration(engine)` | Content generation |
| `useXBookEvent(engine, event, handler)` | Subscribe to events |
| `useWordCount(text)` | Calculate word count |

### Components

| Component | Description |
|-----------|-------------|
| `XBookProvider` | Context provider |
| `BookCard` | Display book card |
| `GenerationProgress` | Progress indicator |
| `GenreSelector` | Genre picker |
| `WordCountDisplay` | Word count display |

---

## 📁 Project Structure

```
2-xbook-engine/
├── src/
│   ├── index.ts           # Main entry point
│   ├── core/              # Core engine
│   │   └── index.ts
│   ├── hooks/             # React hooks
│   │   └── index.ts
│   ├── components/        # React components
│   │   └── index.tsx
│   ├── utils/             # Utilities
│   │   └── index.ts
│   └── types/             # TypeScript types
│       └── index.ts
├── tests/                 # Test files
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎨 Supported Genres

- 📖 Fiction
- 📚 Non-Fiction
- 🚀 Science Fiction
- 🧙 Fantasy
- 🔍 Mystery
- 💕 Romance
- 😱 Thriller
- 👻 Horror
- 👤 Biography
- 🌟 Self-Help
- 💼 Business
- 💻 Technical

---

## 📤 Export Formats

- **PDF** - Print-ready documents
- **EPUB** - E-reader compatible
- **DOCX** - Microsoft Word
- **HTML** - Web-ready
- **Markdown** - Plain text
- **TXT** - Simple text

---

## 🔧 Configuration

```typescript
interface XBookEngineConfig {
  ai: {
    openai?: { apiKey: string; model?: string };
    anthropic?: { apiKey: string; model?: string };
    google?: { apiKey: string; model?: string };
  };
  defaults?: {
    genre?: BookGenre;
    style?: WritingStyle;
    exportFormat?: ExportFormat;
  };
  storage?: {
    type: 'memory' | 'file' | 'database';
  };
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📜 License

MIT License - © 2026 MRF103 Holdings

---

## 🔗 Links

- **Documentation**: https://xbook.mrf103.com/docs
- **GitHub**: https://github.com/firas103103-oss/xbook-engine
- **npm**: https://www.npmjs.com/package/@mrf103/xbook-engine
- **MRF103 Holdings**: https://mrf103.com
