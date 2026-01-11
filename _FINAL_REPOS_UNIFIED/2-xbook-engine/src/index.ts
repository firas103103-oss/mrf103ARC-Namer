/**
 * XBook Engine
 * AI-Powered Content Generation & Book Publishing Engine
 * 
 * @package @mrf103/xbook-engine
 * @version 1.0.0
 * @license MIT
 * @author MRF103 Holdings
 */

// Core Engine
export { XBookEngine, createXBookEngine } from './core';

// Types
export * from './types';

// Hooks
export {
  useXBookEngine,
  useBooks,
  useBook,
  useGeneration,
  useXBookEvent,
  useWordCount,
} from './hooks';

// Components
export {
  XBookProvider,
  useXBookContext,
  BookCard,
  GenerationProgress,
  GenreSelector,
  WordCountDisplay,
} from './components';

// Utilities
export * from './utils';

// Version
export const VERSION = '1.0.0';
